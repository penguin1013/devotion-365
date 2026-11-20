import { Storage } from '@apps-in-toss/web-framework';
import { TOTAL_DAYS, getEntry, tagById } from '../content/days';
import { dateOfDay, dayIndexOf, fmtDot } from './date';

export type FontScale = 'md' | 'lg' | 'xl';

export type DayRecord = {
  status: 'read' | 'done';
  note?: string;
  tags?: string[];
  updatedAt: string;
};

export type UserState = {
  startDate: string | null;
  fontScale: FontScale;
  records: Record<number, DayRecord>;
  /** User.getAnonymousKey 로 받은 사용자 식별키 */
  userKey?: string;
};

const KEY = 'devotion365.state.v1';

export const initialState: UserState = { startDate: null, fontScale: 'md', records: {} };

/** SDK Storage를 쓴다. localStorage는 테스트·출시 환경의 origin이 달라 쓰지 않는다(PRD 6장). */
export async function loadState(): Promise<UserState> {
  try {
    const raw = await Storage.getItem(KEY);
    if (raw) return { ...initialState, ...(JSON.parse(raw) as Partial<UserState>) };
  } catch {
    // 저장소를 못 읽으면 처음 상태로 시작한다
  }
  return initialState;
}

export async function saveState(state: UserState) {
  try {
    await Storage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 다음 변경 때 다시 저장된다
  }
}

export const FONT_SCALE: Record<FontScale, number> = { md: 1, lg: 1.15, xl: 1.3 };

export type Stats = { todayIdx: number; done: number; streak: number; remaining: number };

export function computeStats(state: UserState, today: string): Stats {
  const start = state.startDate ?? today;
  const todayIdx = dayIndexOf(start, today);
  const records = state.records;
  const done = Object.values(records).filter((r) => r.status === 'done').length;

  let i = Math.min(todayIdx, TOTAL_DAYS);
  if (i >= 1 && records[i]?.status !== 'done') i -= 1; // 오늘은 아직 안 했어도 연속이 끊긴 게 아니다
  let streak = 0;
  while (i >= 1 && records[i]?.status === 'done') {
    streak += 1;
    i -= 1;
  }

  const remaining = Math.max(0, TOTAL_DAYS - Math.max(todayIdx, 0));
  return { todayIdx, done, streak, remaining };
}

export function exportText(state: UserState): string {
  const start = state.startDate;
  if (!start) return '';
  const days = Object.keys(state.records)
    .map(Number)
    .filter((d) => state.records[d].note || state.records[d].tags?.length)
    .sort((a, b) => a - b);
  const parts = days.map((d) => {
    const r = state.records[d];
    const tags = (r.tags ?? []).map((t) => `#${tagById(t)?.label ?? t}`).join(' ');
    return [`[${d}일차 · ${fmtDot(dateOfDay(start, d))}]`, getEntry(d).verse.ref, r.note ?? '', tags]
      .filter(Boolean)
      .join('\n');
  });
  return ['오늘의 말씀 365 · 나의 느낀점', ...parts].join('\n\n');
}
