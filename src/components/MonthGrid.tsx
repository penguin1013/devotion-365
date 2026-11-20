import { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "./icons";
import { CalendarIcon } from "./appIcons";
import {
  WEEKDAY_LABELS,
  daysInMonth,
  firstWeekday,
  shiftMonth,
  ymd,
} from "../lib/date";

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
  /** 있으면 'YYYY년 M월' 제목을 눌러 연·월 고르기를 열 수 있다 */
  onTitleClick?: () => void;
};

/** 월 달력. 좌우 화살표와 가로 스와이프로 달을 옮긴다. */
export function MonthGrid({
  month,
  onMonthChange,
  cell,
  onSelect,
  withSub,
  onTitleClick,
}: Props) {
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
          {onTitleClick ? (
            <button
              type="button"
              className="month-title-btn"
              aria-label={`${y}년 ${m}월, 연도와 월 고르기`}
              onClick={onTitleClick}
            >
              <span className="month-badge">
                <CalendarIcon size={18} />
              </span>
              {y}년 {m}월
              <span className="month-title-caret"><ChevronDown size={20} /></span>
            </button>
          ) : (
            <>
              <span className="month-badge">
                <CalendarIcon size={18} />
              </span>
              {y}년 {m}월
            </>
          )}
        </h3>
        <div className="month-nav">
          <button
            type="button"
            className="icon-btn brand"
            aria-label="이전 달"
            onClick={() => go(-1)}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="icon-btn brand"
            aria-label="다음 달"
            onClick={() => go(1)}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
      <div className="month-week" aria-hidden="true">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className={`month-grid ${withSub ? "with-sub" : ""}`}>
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
              className={`day ${info.className ?? ""}`}
              disabled={info.disabled}
              aria-label={info.label ?? `${m}월 ${d}일`}
              onClick={() => onSelect(date)}
            >
              <span className="day-num">{d}</span>
              {withSub && <span className="day-sub">{info.sub ?? ""}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 연·월 한 번에 고르기. 위에서 연도를 넘기고 아래 12칸에서 월을 누르면 그 달 달력으로 돌아간다.
 * 1월 1일처럼 멀리 있는 날짜를 스와이프 없이 바로 찾아가게 한다.
 */
export function YearMonthPicker({
  value,
  current,
  minYear,
  maxYear,
  onPick,
  onClose,
}: {
  /** 지금 달력에 떠 있던 달 */
  value: Month;
  /** 오늘이 속한 달(테두리로 표시) */
  current: Month;
  minYear: number;
  maxYear: number;
  onPick: (m: Month) => void;
  onClose: () => void;
}) {
  const [year, setYear] = useState(value.y);
  return (
    <div className="ym-picker">
      <div className="month-head">
        <h3 className="month-title">
          <button
            type="button"
            className="month-title-btn"
            aria-label="연도와 월 고르기 닫기"
            onClick={onClose}
          >
            <span className="month-badge">
              <CalendarIcon size={18} />
            </span>
            {year}년
            <span className="month-title-caret"><ChevronUp size={20} /></span>
          </button>
        </h3>
        <div className="month-nav">
          <button
            type="button"
            className="icon-btn brand"
            aria-label="이전 해"
            disabled={year <= minYear}
            onClick={() => setYear((v) => v - 1)}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="icon-btn brand"
            aria-label="다음 해"
            disabled={year >= maxYear}
            onClick={() => setYear((v) => v + 1)}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
      <div className="ym-grid">
        {Array.from({ length: 12 }, (_, i) => {
          const m = i + 1;
          const selected = year === value.y && m === value.m;
          const isNow = year === current.y && m === current.m;
          return (
            <button
              key={m}
              type="button"
              className={`ym-cell ${selected ? "is-selected" : ""} ${isNow ? "is-today" : ""}`}
              aria-pressed={selected}
              onClick={() => onPick({ y: year, m })}
            >
              {m}월
            </button>
          );
        })}
      </div>
    </div>
  );
}
