import { useState } from "react";
import {
  MonthGrid,
  YearMonthPicker,
  type Month,
} from "../components/MonthGrid";
import { ChevronRight } from "../components/icons";
import { CalendarIcon } from "../components/appIcons";
import { TOTAL_DAYS } from "../content/days";
import { dateOfDay, fmtDot, parseYmd } from "../lib/date";

export function StartSummary({ start }: { start: string }) {
  return (
    <div className="card start-summary">
      <div>
        <span className="summary-tag">1일차</span>
        <p className="summary-date">{fmtDot(start)}</p>
      </div>
      <span className="summary-arrow">
        <ChevronRight size={20} />
      </span>
      <div className="align-end">
        <span className="summary-tag">{TOTAL_DAYS}일차</span>
        <p className="summary-date">{fmtDot(dateOfDay(start, TOTAL_DAYS))}</p>
      </div>
    </div>
  );
}

/** 시작일 고르기 — 온보딩과 설정의 시작일 변경이 함께 쓴다. */
export function StartPicker({
  value,
  today,
  onChange,
}: {
  value: string;
  today: string;
  onChange: (d: string) => void;
}) {
  const [month, setMonth] = useState<Month>(() => {
    const { y, m } = parseYmd(value);
    return { y, m };
  });
  const [pickingMonth, setPickingMonth] = useState(false);
  const now = parseYmd(today);
  return (
    <div className="card calendar-card">
      {pickingMonth ? (
        <YearMonthPicker
          value={month}
          current={{ y: now.y, m: now.m }}
          minYear={now.y - 10}
          maxYear={now.y + 2}
          onPick={(m) => {
            setMonth(m);
            setPickingMonth(false);
          }}
          onClose={() => setPickingMonth(false)}
        />
      ) : (
        <MonthGrid
          month={month}
          onMonthChange={setMonth}
          onTitleClick={() => setPickingMonth(true)}
          onSelect={onChange}
          cell={(date) => ({
            className: [
              date === value ? "is-selected" : "",
              date === today ? "is-today" : "",
            ].join(" "),
            label: `${fmtDot(date)}${date === value ? ", 선택됨" : ""}`,
          })}
        />
      )}
    </div>
  );
}

export function Onboarding({
  today,
  onStart,
}: {
  today: string;
  onStart: (start: string) => void;
}) {
  const [start, setStart] = useState(today);
  return (
    <div className="screen">
      <main className="content">
        <span className="onboard-badge">
          <CalendarIcon size={28} />
        </span>
        <h1 className="display">
          언제부터
          <br />
          시작할까요?
        </h1>
        <p className="lead">
          선택한 날이 <strong>1일차</strong>가 돼요.
          <br />
          이미 책으로 읽고 있었다면 지난 날짜도 괜찮아요.
        </p>
        <StartPicker value={start} today={today} onChange={setStart} />
        <StartSummary start={start} />
      </main>
      <div className="dock dock-safe">
        <button
          type="button"
          className="btn btn-primary btn-cta"
          onClick={() => onStart(start)}
        >
          이 날부터 시작하기
        </button>
      </div>
    </div>
  );
}
