import { DayReader } from '../components/DayReader';
import { ProgressRing } from '../components/ui';
import { CalendarIcon, CheckIcon, PencilIcon, SettingsIcon } from '../components/appIcons';
import { TOTAL_DAYS, getEntry } from '../content/days';
import { dateOfDay, fmtLong, fmtMonthDay } from '../lib/date';
import type { Stats, UserState } from '../lib/state';

type Props = {
  state: UserState;
  today: string;
  stats: Stats;
  onWrite: (day: number) => void;
  onOpenDay: (day: number) => void;
  onOpenSettings: () => void;
  onOpenRecords: () => void;
  onRead: (day: number) => void;
};

function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="icon-btn round" aria-label="설정" onClick={onClick}>
      <SettingsIcon size={24} />
    </button>
  );
}

export function TodayScreen({ state, today, stats, onWrite, onOpenDay, onOpenSettings, onOpenRecords, onRead }: Props) {
  const start = state.startDate!;
  const idx = stats.todayIdx;

  if (idx < 1) {
    return (
      <main className="content">
        <div className="row-between">
          <p className="meta">
            <CalendarIcon size={18} />
            {fmtLong(today)}
          </p>
          <SettingsButton onClick={onOpenSettings} />
        </div>
        <div className="empty">
          <span className="empty-emoji">🌱</span>
          <h1 className="title">아직 시작 전이에요</h1>
          <p className="lead center">
            D-{1 - idx} · {fmtMonthDay(start)}에 1일차가 열려요
          </p>
          <button type="button" className="btn btn-secondary" onClick={onOpenSettings}>
            시작일 바꾸기
          </button>
        </div>
      </main>
    );
  }

  if (idx > TOTAL_DAYS) {
    return (
      <main className="content">
        <div className="row-between">
          <p className="meta">
            <CalendarIcon size={18} />
            {fmtLong(today)}
          </p>
          <SettingsButton onClick={onOpenSettings} />
        </div>
        <div className="empty">
          <span className="empty-emoji">🎉</span>
          <h1 className="title">365일 완주!</h1>
          <p className="lead center">
            {fmtMonthDay(start)}부터 {fmtMonthDay(dateOfDay(start, TOTAL_DAYS))}까지,
            <br />
            {stats.done}일의 묵상을 기록했어요.
          </p>
          <button type="button" className="btn btn-secondary" onClick={onOpenRecords}>
            남긴 느낀점 보기
          </button>
        </div>
      </main>
    );
  }

  const record = state.records[idx];
  const done = record?.status === 'done';

  return (
    <>
      <main className="content">
        <div className="row-between">
          <p className="meta">
            <CalendarIcon size={18} />
            {fmtLong(today)}
          </p>
          <SettingsButton onClick={onOpenSettings} />
        </div>
        <div className="today-head">
          <h1 className="display">
            {idx}일차 <span className="display-total">/ {TOTAL_DAYS}</span>
          </h1>
          <ProgressRing value={idx / TOTAL_DAYS} />
        </div>
        <div className="today-chips">
          {done ? (
            <span className="today-chip is-done">
              <CheckIcon size={16} />
              오늘 묵상 완료
            </span>
          ) : (
            <span className="today-chip">
              <span className="tf">☀️</span>
              오늘의 말씀이 도착했어요
            </span>
          )}
          {stats.streak > 0 && (
            <span className="today-chip">
              <span className="tf">🔥</span>
              {stats.streak}일 연속
            </span>
          )}
        </div>
        <DayReader key={idx} entry={getEntry(idx)} bodyLabel="오늘의 묵상" onReadEnd={() => onRead(idx)} onMove={onOpenDay} />
      </main>
      <div className="dock">
        <button type="button" className="btn btn-primary btn-cta" onClick={() => onWrite(idx)}>
          <PencilIcon size={20} />
          {done ? '느낀점 수정하기' : '느낀점 쓰기'}
        </button>
      </div>
    </>
  );
}
