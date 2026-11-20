// 원고 텍스트(pdftotext -enc UTF-8) → src/content/days.json
// 사용: node convert.mjs <fixed.txt> <out.json> <report.txt> <raw.txt>
import { readFileSync, writeFileSync } from 'node:fs';
import { decideJoin, loadCorpus } from './joinrule.mjs';
loadCorpus(process.argv[5]);

const [, , inPath, outPath, reportPath] = process.argv;
const lines = readFileSync(inPath, 'utf8').replace(/\f/g, '\n').split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));
const report = [];

// 1) 일차 머리글 (1부터 순서대로만 인정 — "365일 묵상집은…" 같은 문장 오인 방지)
const heads = [];
lines.forEach((l, i) => {
  const m = l.match(/^\s*(\d{1,3})일?\s+(.+)$/);
  if (!m) return;
  const n = +m[1];
  const want = heads.length ? heads[heads.length - 1].day + 1 : 1;
  if (n === want && n <= 365) heads.push({ day: n, line: i, title: m[2].trim() });
});
const endLine = lines.findIndex((l) => /^맺는 말/.test(l));
if (heads.length !== 365) throw new Error(`일차 머리글 ${heads.length}개`);

const PUNCT_END = /[.!?。…”"’'」』)\]:;,~>]$/;
const HANGUL_END = /[가-힣]$/;
const VERSE_CAPTION = /^[가-힣]+\s?\d+(장|편)\s?\d+절/;

// 2) 묵상 글: 빈 줄 또는 문장 끝에서 문단을 나누고, 문장 중간에서 꺾인 줄은 잇는다
function joinWrapped(block, day) {
  const paras = [];
  let cur = null;
  let prevBlank = true;
  for (const raw of block) {
    const l = raw.trim();
    if (!l) {
      if (cur !== null) { paras.push(cur); cur = null; }
      prevBlank = true;
      continue;
    }
    const canJoin =
      cur !== null && !prevBlank && cur.length > 40 && /^[가-힣(]/.test(l) && !VERSE_CAPTION.test(l) &&
      (/절$/.test(cur) || (HANGUL_END.test(cur) && !PUNCT_END.test(cur) && !/다$/.test(cur)));
    if (canJoin) {
      const ha = cur.match(/([가-힣]+)$/);
      const hb = l.match(/^([가-힣]+)/);
      const glue = !/절$/.test(cur) && ha && hb && decideJoin(ha[1], hb[1]).join ? '' : ' ';
      report.push(`[${day}일] 줄 이어붙임(${glue ? '띄움' : '붙임'}): …${cur.slice(-10)}${glue}${l.slice(0, 10)}…`);
      cur += glue + l;
    } else {
      if (cur !== null) paras.push(cur);
      cur = l;
    }
    prevBlank = false;
  }
  if (cur !== null) paras.push(cur);
  return paras;
}

// 3) 본문 줄 해석: "시편 141:3 3절 주님, …", "베드로전서 1:3-4 3절 … 4절 …", "시편 109편 17절 …"
function parseVerse(src, day) {
  const s = src.replace(/^[(（]/, '').trim();
  let book;
  let chap;
  let passage;
  let rest;
  let m = s.match(/^(.+?)\s*(\d+):([\d\-–~,: ]+?)\)?\s+(.*)$/s) || s.match(/^(.+?)\s*(\d+):([\d\-–~,:]+)\)?$/);
  if (m) {
    book = m[1].trim(); chap = m[2]; passage = `${book} ${chap}:${m[3].trim()}`; rest = (m[4] ?? '').trim();
  } else if ((m = s.match(/^(.+?)\s*(\d+)(?:편|장)\s+(.*)$/s))) {
    book = m[1].trim(); chap = m[2]; passage = `${book} ${chap}`; rest = m[3].trim();
  } else {
    report.push(`[${day}일] ⚠ 본문 형식 해석 실패: ${s.slice(0, 50)}`);
    return { passage: s, ref: s, text: '' };
  }
  rest = rest.replace(/^\d+장\s+(?=\d+절)/, ''); // "9장 27절 27절" 꼴

  const nums = [];
  let text = rest;
  const marks = [...rest.matchAll(/(?:^|\s)(\d+)절(?=\s)/g)];
  if (marks.length && marks[0].index === 0) {
    const segs = [];
    marks.forEach((mk, i) => {
      const from = mk.index + mk[0].length;
      const to = i + 1 < marks.length ? marks[i + 1].index : rest.length;
      const seg = rest.slice(from, to).trim();
      if (!seg) return; // 같은 절 번호 반복
      nums.push(+mk[1]);
      segs.push(seg);
    });
    text = segs.join('\n');
  }
  // 장을 넘는 본문(4:32-5:11)에서 절 번호가 시작 절보다 작으면 끝 장으로 본다
  const cross = passage.match(/:(\d+)\s*[-–~]\s*(\d+):/);
  if (cross && nums.length && nums.every((n) => n < +cross[1])) chap = cross[2];

  let ref = passage;
  if (nums.length) {
    const uniq = [...new Set(nums)].sort((a, b) => a - b);
    const contiguous = uniq.every((n, i) => i === 0 || n === uniq[i - 1] + 1);
    const v = uniq.length === 1 ? `${uniq[0]}` : contiguous ? `${uniq[0]}-${uniq[uniq.length - 1]}` : uniq.join(',');
    ref = `${book} ${chap}:${v}`;
  }
  if (!text) report.push(`[${day}일] ⚠ 암송 구절 본문 없음 (본문: ${passage})`);
  if (text && !/[.!?”"’]$/.test(text)) report.push(`[${day}일] ℹ 암송 구절이 문장 중간에서 끝남: …${text.slice(-15)}`);
  return { passage, ref, text };
}

// 문단 중간의 번호 목록("… 권한다. 1. 다윗은", "… 없다! 1) 자기 눈") 앞에서 줄을 바꾼다.
// 문단 안 줄바꿈은 \n 하나로 두고, 화면은 white-space: pre-line 으로 보여 준다.
function breakLists(p) {
  return p
    .replace(/(?<=[^\s,:(~\-])[ \t]+(\d{1,2}\)\s)/g, '\n$1') // "(느6:2, 10)" 같은 장절 표기는 제외
    .replace(/(?<=[.!?”"’:)])[ \t]+(\d{1,2}\.\s(?=[가-힣“"‘']))/g, '\n$1');
}

const glueVerse = (acc, l) => {
  if (!acc) return l;
  const mk = l.match(/^(\d+)절\s+(.*)$/);
  if (mk && HANGUL_END.test(acc) && !PUNCT_END.test(acc)) return acc + mk[2]; // "올라갔 / 10절 다." 꼴
  if (HANGUL_END.test(acc) && !PUNCT_END.test(acc) && !/절$/.test(acc)) {
    const ha = acc.match(/([가-힣]+)$/);
    const hb = l.match(/^([가-힣]+)/);
    return hb && decideJoin(ha[1], hb[1]).join ? acc + l : `${acc} ${l}`;
  }
  return `${acc} ${l}`;
};

const out = heads.map((h, k) => {
  const blk = lines.slice(h.line + 1, k < heads.length - 1 ? heads[k + 1].line : endLine);
  const bi = blk.findIndex((l) => /^\s*⦁\s*본문/.test(l));
  let after = bi + 1;
  let verseSrc = blk[bi].replace(/^\s*⦁\s*본문\s*:?\s*/, '').trim();
  if (!verseSrc) {
    // 본문이 다음 줄들에 이어짐(빈 줄까지)
    while (after < blk.length && !blk[after].trim()) after++;
    const vl = [];
    while (after < blk.length && blk[after].trim()) vl.push(blk[after++].trim());
    verseSrc = vl.reduce(glueVerse, '');
  } else if (/^\S+\s?\d+:[\d\-–~,:]+\)?$/.test(verseSrc) && /^\d+절\s/.test(blk[after]?.trim() ?? '')) {
    // 본문 범위만 있고 구절은 다음 줄
    verseSrc = glueVerse(verseSrc, blk[after++].trim());
  }
  const verse = parseVerse(verseSrc, h.day);
  const paras = joinWrapped(blk.slice(after), h.day);
  // 원고에서 구절과 묵상 첫 문장이 한 줄에 붙은 날: 구절 뒤 문장을 묵상 글 앞으로 옮긴다
  const SPLIT_AFTER = { 202: '인내가 필요합니다.' };
  const cut = SPLIT_AFTER[h.day];
  if (cut && verse.text.includes(cut)) {
    const at = verse.text.indexOf(cut) + cut.length;
    const moved = verse.text.slice(at).trim();
    verse.text = verse.text.slice(0, at);
    if (moved) paras.unshift(moved);
  }
  const title = h.title.replace(/[.。]\s*$/, '').trim();
  const bodyText = paras.map(breakLists).join('\n\n');
  if (bodyText.length < 200) report.push(`[${h.day}일] ⚠ 묵상 글이 짧음(${bodyText.length}자)`);
  if (/그림|사진/.test(bodyText)) report.push(`[${h.day}일] ℹ 그림·사진을 가리키는 문장이 있음(이미지는 옮겨지지 않음)`);
  return { day: h.day, title, passage: verse.passage, verse: { ref: verse.ref, text: verse.text }, body: bodyText };
});

writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
writeFileSync(reportPath, report.join('\n') + '\n');
console.log(`days=${out.length} report=${report.length}`);
