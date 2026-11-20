// 줄바꿈 자리에서 두 한글 덩어리를 붙일지 띄울지 정한다.
// 근거: 원고(raw, 시각적 줄 안쪽)에서 붙여 쓴 빈도 vs 띄어 쓴 빈도. 근거가 없으면 조사·어미 규칙.
import { readFileSync } from 'node:fs';

let corpus = '';
export function loadCorpus(rawPath) {
  corpus = readFileSync(rawPath, 'utf8').replace(/\f/g, '\n').split(/\r?\n/).map((l) => l.trim()).join('\n');
}

const count = (s) => {
  let n = 0;
  for (let i = corpus.indexOf(s); i >= 0; i = corpus.indexOf(s, i + 1)) n++;
  return n;
};

const PARTICLE_ONLY = /^(다|고|며|면|서|게|지|도|를|을|의|는|은|이|가|에|와|과|로|으로|에서|에게|께|까지|부터|처럼|만|요|냐|니|라|며|나)$/;
const ENDING_START = /^(거나|던|이던|들이|들을|들의|들은|들도|들에게|들과|들로|니다|습니다|습니까|었|였|셨|았|겠|시었|으며|으면|으로|으니|에서|에게|이다|입니다|이었|이라|이며|이고|라고|라는|라면|다고|다는|다면|도록|면서|지만|지요|든지)/;
const HADA_START = /^(한다|합니다|하였|했다|했고|했던|하는|하여|하고|하며|할 |할$|하게|해야|됩니다|된다|되었|됐다)/;
const PARTICLE_END = /(게|을|를|이|가|는|은|도|에|고|서|며|면|의|와|과|로|만)$/;

export function decideJoin(a, b) {
  const variants = [
    [a, b],
    [a, b.slice(0, 2)],
    [a.slice(-3), b.slice(0, 2)],
    [a.slice(-2), b.slice(0, 2)],
    [a.slice(-2), b.slice(0, 1)],
  ];
  for (const [x, y] of variants) {
    if (!x || !y) continue;
    const j = count(x + y);
    const s = count(`${x} ${y}`);
    if (j + s >= 2 || (j + s >= 1 && x.length + y.length >= 4)) return { join: j > s, why: `${x}${y}:${j} / ${x} ${y}:${s}` };
  }
  if (PARTICLE_ONLY.test(b) || ENDING_START.test(b)) return { join: true, why: 'rule:어미·조사' };
  if (HADA_START.test(b) && a.length >= 2 && !PARTICLE_END.test(a)) return { join: true, why: 'rule:하다' };
  return { join: false, why: 'rule:띄움' };
}
