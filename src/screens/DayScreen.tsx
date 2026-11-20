import { DayReader } from '../components/DayReader';
import { CalendarIcon, CheckIcon, LockIcon, PencilIcon } from '../components/appIcons';
import { getEntry } from '../content/days';
import { dateOfDay, fmtLong, fmtMonthDay } from '../lib/date';
import type { UserState } from '../lib/state';

type Props = {
  day: number;
  state: UserState;
  todayIdx: number;
  onMove: (day: number) => void;
  onWrite: (day: number) => void;
  onRead: (day: number) => void;
  onBackToToday: () => void;
};

/** 지난 일차 다시 보기. 미래 일차는 제목만 보이고 잠겨 있다(PRD 4장). */
export function DayScreen({ day, state, todayIdx, onMove, onWrite, onRead, onBackToToday }: Props) {
  const start = state.startDate!;
  const date = dateOfDay(start, day);
  const entry = getEntry(day);
  const record = state.records[day];

  if (day > todayIdx) {
    return (
      <div className="screen">
        <main className="content">
          <p className="meta">
            <CalendarIcon size={18} />
            {fmtLong(date)}
          </p>
          <h1 className="display">{day}일차</h1>
          <div className="card locked">
            <span className="locked-icon">
              <LockIcon size={24} />
            </span>
            <h2 className="title">{entry.title}</h2>
            <p className="lead center">{fmtMonthDay(date)}에 열려요</p>
          </div>
        </main>
        <div className="dock dock-safe">
          <button type="button" className="btn btn-secondary btn-cta" onClick={onBackToToday}>
            오늘 말씀으로 가기
          </button>
        </div>
      </div>
    );
  }

  const done = record?.status === 'done';
  return (
    <div className="screen">
      <main className="content">
        <p className="meta">
            <CalendarIcon size={18} />
            {fmtLong(date)}
          </p>
        <h1 className="display">{day}일차</h1>
        {done && (
          <p className="done-badge">
            <CheckIcon size={18} />
            묵상을 기록한 날이에요
          </p>
        )}
        <DayReader key={day} entry={entry} bodyLabel={`${day}일차 묵상`} onReadEnd={() => onRead(day)} onMove={onMove} />
        {record?.note && (
          <section className="card my-note">
            <p className="eyebrow">내가 남긴 느낀점</p>
            <p className="note-text read-scale">{record.note}</p>
          </section>
        )}
      </main>
      <div className="dock dock-safe">
        <button type="button" className="btn btn-primary btn-cta" onClick={() => onWrite(day)}>
          <PencilIcon size={20} />
          {done ? '느낀점 수정하기' : '느낀점 쓰기'}
        </button>
      </div>
    </div>
  );
}
