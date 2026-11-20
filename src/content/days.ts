/**
 * 일차별 묵상 콘텐츠 — 「365일 묵상집」 원고(docs/365일 묵상집(1-365) 원고.pdf)에서 변환한 `days.json`.
 *
 * 1.3MB라 첫 화면 번들에 넣지 않고 별도 파일로 나눠 `loadDays()`로 한 번 불러온다.
 * 앱은 시작할 때 저장 상태와 함께 이것을 기다린 뒤 화면을 그린다.
 * 원고에는 일차별 질문이 없어 느낀점 쓰기 질문은 공통 문구를 쓴다.
 */

export type DayEntry = {
  day: number;
  title: string;
  /** 원고의 본문 범위(예: 베드로전서 1:3-4) */
  passage: string;
  /** 암송 구절 — ref는 실제로 실린 절만 */
  verse: { ref: string; text: string };
  /** 문단은 빈 줄(

)로 구분 */
  body: string;
  question: string;
};

type RawDay = Omit<DayEntry, 'question'>;

export const TOTAL_DAYS = 365;
const DEFAULT_QUESTION = '오늘 말씀에서 마음에 남은 것은 무엇인가요?';

let DAYS: RawDay[] = [];
let pending: Promise<void> | null = null;

export function loadDays(): Promise<void> {
  pending ??= import('./days.json').then((m) => {
    DAYS = m.default as RawDay[];
  });
  return pending;
}

export function getEntry(day: number): DayEntry {
  const d = Math.min(Math.max(day, 1), TOTAL_DAYS);
  const raw = DAYS[d - 1];
  if (!raw) return { day: d, title: '', passage: '', verse: { ref: '', text: '' }, body: '', question: DEFAULT_QUESTION };
  return { ...raw, question: DEFAULT_QUESTION };
}

export type Tag = { id: string; emoji: string; label: string };

export const TAGS: Tag[] = [
  { id: 'thanks', emoji: '🙏', label: '감사' },
  { id: 'comfort', emoji: '🕊️', label: '위로' },
  { id: 'peace', emoji: '🌿', label: '평안' },
  { id: 'resolve', emoji: '✊', label: '결단' },
  { id: 'repent', emoji: '💧', label: '회개' },
  { id: 'prayer', emoji: '📝', label: '기도제목' },
];

export const tagById = (id: string) => TAGS.find((t) => t.id === id);
