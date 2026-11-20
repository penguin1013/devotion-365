/** 날짜는 전부 Asia/Seoul 기준 'YYYY-MM-DD' 문자열로 다룬다. */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n: number) => String(n).padStart(2, '0');

export const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

export function todayYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function parseYmd(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
}

const toUtc = (s: string) => {
  const { y, m, d } = parseYmd(s);
  return Date.UTC(y, m - 1, d);
};

export const diffDays = (a: string, b: string) => Math.round((toUtc(a) - toUtc(b)) / 86400000);

export function addDays(s: string, n: number): string {
  const t = new Date(toUtc(s) + n * 86400000);
  return ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export const weekdayOf = (s: string) => WEEKDAYS[new Date(toUtc(s)).getUTCDay()];

/** 2026.10.25 (일) */
export function fmtDot(s: string) {
  const { y, m, d } = parseYmd(s);
  return `${y}.${pad(m)}.${pad(d)} (${weekdayOf(s)})`;
}

/** 11월 16일 월요일 */
export function fmtLong(s: string) {
  const { m, d } = parseYmd(s);
  return `${m}월 ${d}일 ${weekdayOf(s)}요일`;
}

/** 11월 16일 */
export function fmtMonthDay(s: string) {
  const { m, d } = parseYmd(s);
  return `${m}월 ${d}일`;
}

/** 11.16 */
export function fmtShort(s: string) {
  const { m, d } = parseYmd(s);
  return `${pad(m)}.${pad(d)}`;
}

/** 시작일이 1일차. 시작 전이면 0 이하, 365일 이후면 365 초과 */
export const dayIndexOf = (start: string, date: string) => diffDays(date, start) + 1;
export const dateOfDay = (start: string, day: number) => addDays(start, day - 1);

export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export const firstWeekday = (y: number, m: number) => new Date(Date.UTC(y, m - 1, 1)).getUTCDay();

export function shiftMonth(y: number, m: number, delta: number) {
  const idx = y * 12 + (m - 1) + delta;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}

export const WEEKDAY_LABELS = WEEKDAYS;
