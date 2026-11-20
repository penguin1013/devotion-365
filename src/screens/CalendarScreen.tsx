import { useState } from 'react';
import { MonthGrid, type CellInfo, type Month } from '../components/MonthGrid';
import { ChevronRight } from '../components/icons';
import { CalendarIcon } from '../components/appIcons';
import { TOTAL_DAYS } from '../content/days';
import { dayIndexOf, fmtMonthDay, parseYmd } from '../lib/date';
import type { Stats, UserState } from '../lib/state';

type Props = {
  state: UserState;
  today: string;
  stats: Stats;
  onOpenDay: (day: number) => void;
  onOpenSettings: () => void;
};

export function CalendarScreen({ state, today, stats, onOpenDay, onOpenSettings }: Props) {
  const start = state.startDate!;
  const current = parseYmd(today);
  const [month, setMonth] = useState<Month>({ y: current.y, m: current.m });
  const isCurrentMonth = month.y === current.y && month.m === current.m;

  const cell = (date: string): CellInfo => {
    const idx = dayIndexOf(start, date);
    const { m, d } = parseYmd(date);
    if (idx < 1 || idx > TOTAL_DAYS) {
      return { className: 'is-out', disabled: true, label: `${m}월 ${d}일, 기간 밖` };
    }
    const status = state.records[idx]?.status;
    const classes = [idx === 1 ? 'is-start' : ''];
    let desc: string;
    if (date === today) {
      classes.push('is-today', status === 'done' ? 'is-done' : '');
      desc = status === 'done' ? '오늘, 묵상 완료' : '오늘';
    } else if (date > today) {
      classes.push('is-future');
      desc = '아직 열리지 않음';
    } else if (status === 'done') {
      classes.push('is-done');
      desc = '묵상 완료';
    } else if (status === 'read') {
      classes.push('is-read');
      desc = '읽기만 함';
    } else {
      classes.push('is-miss');
      desc = '놓친 날';
    }
    return {
      className: classes.join(' '),
      sub: idx === 1 ? '시작' : String(idx),
      label: `${m}월 ${d}일 ${idx}일차, ${desc}`,
    };
  };

  return (
    <main className="content">
      <div className="row-between">
        <h1 className="display">달력</h1>
        {!isCurrentMonth && (
          <button type="button" className="text-btn" onClick={() => setMonth({ y: current.y, m: current.m })}>
            <CalendarIcon size={18} />
            이번 달
          </button>
        )}
      </div>

      <div className="stats">
        <div className="card stat">
          <p className="stat-label">
            <span className="tf">✅</span>완료
          </p>
          <p className="stat-value">
            {stats.done}
            <span className="stat-unit">일</span>
          </p>
        </div>
        <div className="card stat">
          <p className="stat-label">
            <span className="tf">🔥</span>연속
          </p>
          <p className="stat-value">
            {stats.streak}
            <span className="stat-unit">일</span>
          </p>
        </div>
        <div className="card stat">
          <p className="stat-label">
            <span className="tf">🗓️</span>남은 날
          </p>
          <p className="stat-value">
            {stats.remaining}
            <span className="stat-unit">일</span>
          </p>
        </div>
      </div>

      <div className="card calendar-card">
        <MonthGrid
          month={month}
          onMonthChange={setMonth}
          withSub
          cell={cell}
          onSelect={(date) => onOpenDay(dayIndexOf(start, date))}
        />
        <div className="legend">
          <span>
            <i className="dot dot-done" />
            묵상 완료
          </span>
          <span>
            <i className="dot dot-read" />
            읽기만
          </span>
          <span>
            <i className="dot dot-today" />
            오늘
          </span>
        </div>
      </div>

      <button type="button" className="card row-card" onClick={onOpenSettings}>
        <span className="row-icon tf">🌱</span>
        <span className="row-body">
          <span className="row-title">{fmtMonthDay(start)}에 시작했어요</span>
          <span className="row-sub">시작일은 설정에서 바꿀 수 있어요</span>
        </span>
        <span className="row-chevron">
          <ChevronRight size={20} />
        </span>
      </button>
    </main>
  );
}
