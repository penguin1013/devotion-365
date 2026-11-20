// PDF 줄바꿈 자리에 끼어든 띄어쓰기를 바로잡는다.
// raw.txt(시각적 줄 단위) 의 줄 경계마다, manuscript.txt(문단 단위)에 "앞줄끝 + 공백 + 뒷줄머리"로 이어진 자리를 찾아
// 원고 안에서 붙여 쓴 빈도와 띄어 쓴 빈도를 비교해 공백을 남길지 지운다.
// 사용: node fixspaces.mjs <raw.txt> <manuscript.txt> <out.txt> <log.txt>
import { readFileSync, writeFileSync } from 'node:fs';
import { decideJoin, loadCorpus } from './joinrule.mjs';

const [, , rawPath, textPath, outPath, logPath] = process.argv;
const raw = readFileSync(rawPath, 'utf8').replace(/\f/g, '\n').split(/\r?\n/).map((l) => l.trim());
let text = readFileSync(textPath, 'utf8').replace(/\r/g, '');
loadCorpus(rawPath);
const log = [];

let fixed = 0;
let kept = 0;
let missed = 0;
for (let i = 0; i + 1 < raw.length; i++) {
  const l1 = raw[i];
  const l2 = raw[i + 1];
  if (!l1 || !l2) continue;
  const ma = l1.match(/([가-힣]+)$/);
  const mb = l2.match(/^([가-힣]+)/);
  if (!ma || !mb) continue;
  const tail = l1.slice(-Math.min(12, l1.length));
  const head = l2.slice(0, Math.min(12, l2.length));
  const needle = `${tail} ${head}`;
  const pos = text.indexOf(needle); // 읽는 순서가 raw와 다를 수 있어 처음부터 찾는다(앞뒤 12자라 거의 유일)
  if (pos < 0) { missed++; continue; } // 문단 경계(줄바꿈)이거나 못 찾음
  const { join, why } = decideJoin(ma[1], mb[1]);
  const at = pos + tail.length;
  if (join) {
    text = text.slice(0, at) + text.slice(at + 1);
    fixed++;
    log.push(`붙임  ${ma[1]}|${mb[1]}  (${why})`);
  } else {
    kept++;
    log.push(`띄움  ${ma[1]} ${mb[1]}  (${why})`);
  }
}
writeFileSync(outPath, text);
writeFileSync(logPath, log.join('\n') + '\n');
console.log(`fixed=${fixed} kept=${kept} missed=${missed}`);
