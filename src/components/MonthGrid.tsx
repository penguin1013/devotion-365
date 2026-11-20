import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from './icons';
import { CalendarIcon } from './appIcons';
import { WEEKDAY_LABELS, daysInMonth, firstWeekday, shiftMonth, ymd } from '../lib/date';

export type Month = { y: number; m: number };

export type CellInfo = {
  className?: string;
  /** 날짜 아래 작은 글씨(일차 번호·"시작") */
  sub?: string;
  disabled?: boolean;
  label?: string;
};

type Props = {
  month: Month;
  onMonthChange: (m: Month) => void;
  cell: (date: string) => CellInfo;
  onSelect: (date: string) => void;
  withSub?: boolean;
};

/** 월 달력. 좌우 화살표와 가로 스와이프로 달을 옮긴다. */
export function MonthGrid({ month, onMonthChange, cell, onSelect, withSub }: Props) {
  const { y, m } = month;
  const lead = firstWeekday(y, m);
  const total = daysInMonth(y, m);
  const touchX = useRef<number | null>(null);
  const go = (delta: number) => onMonthChange(shiftMonth(y, m, delta));

  return (
    <div
      className="month"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="month-head">
        <h3 className="month-title">
          <span className="month-badge">
            <CalendarIcon size={18} />
          </span>
          {y}년 {m}월
        </h3>
        <div className="month-nav">
          <button type="button" className="icon-btn brand" aria-label="이전 달" onClick={() => go(-1)}>
            <ChevronLeft size={22} />
          </button>
          <button type="button" className="icon-btn brand" aria-label="다음 달" onClick={() => go(1)}>
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
      <div className="month-week" aria-hidden="true">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className={`month-grid ${withSub ? 'with-sub' : ''}`}>
        {Array.from({ length: lead }, (_, i) => (
          <span key={`lead-${i}`} />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const d = i + 1;
          const date = ymd(y, m, d);
          const info = cell(date);
          return (
            <button
              key={date}
              type="button"
              className={`day ${info.className ?? ''}`}
              disabled={info.disabled}
              aria-label={info.label ?? `${m}월 ${d}일`}
              onClick={() => onSelect(date)}
            >
              <span className="day-num">{d}</span>
              {withSub && <span className="day-sub">{info.sub ?? ''}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
