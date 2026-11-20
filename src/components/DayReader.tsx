import { useEffect, useRef, useState } from 'react';
import type { DayEntry } from '../content/days';
import { TOTAL_DAYS } from '../content/days';
import { ChevronLeft, ChevronRight } from './icons';
import { EyeIcon, EyeOffIcon } from './appIcons';

type Props = {
  entry: DayEntry;
  bodyLabel: string;
  /** 묵상 본문 끝까지 보면 한 번 호출 → `읽음` */
  onReadEnd: () => void;
  onMove: (day: number) => void;
};

/** 암송 구절 + 묵상 본문 + 전/다음 일차. 오늘 탭과 일차 상세가 함께 쓴다. */
export function DayReader({ entry, bodyLabel, onReadEnd, onMove }: Props) {
  const [hidden, setHidden] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const readRef = useRef(onReadEnd);
  useEffect(() => {
    readRef.current = onReadEnd;
  });

  // 일차가 바뀌면 부모가 key로 새로 그려서 가리기 상태도 초기화된다
  useEffect(() => {
    const el = endRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        readRef.current();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [entry.day]);

  const { day, verse, title, body, passage } = entry;

  return (
    <>
      <section className="verse-card" aria-label="암송 구절">
        <div className="verse-head">
          <span className="verse-eyebrow">오늘의 암송</span>
          <button
            type="button"
            className="verse-toggle"
            aria-pressed={hidden}
            onClick={() => setHidden((h) => !h)}
          >
            {hidden ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
            {hidden ? '구절 보기' : '가리고 외우기'}
          </button>
        </div>
        <p
          className={`verse-text read-scale ${hidden ? 'is-hidden' : ''}`}
          aria-hidden={hidden}
          onClick={() => hidden && setHidden(false)}
        >
          {verse.text}
        </p>
        {hidden && <p className="verse-hint">외운 뒤 눌러서 확인해 보세요</p>}
        <p className="verse-ref">{verse.ref}</p>
      </section>

      <article className="card meditation">
        <p className="eyebrow">{bodyLabel}</p>
        <h2 className="meditation-title read-scale">{title}</h2>
        {passage && (
          <p className="meditation-passage">
            <span className="passage-label">본문</span>
            {passage}
          </p>
        )}
        {body.split('\n\n').map((para, i) => (
          <p key={i} className="meditation-body read-scale">
            {para}
          </p>
        ))}
        <div ref={endRef} aria-hidden="true" />
      </article>

      <div className="day-move">
        <button type="button" className="move-btn" disabled={day <= 1} onClick={() => onMove(day - 1)}>
          <ChevronLeft size={20} />
          {day > 1 ? `${day - 1}일차` : '첫날'}
        </button>
        <button
          type="button"
          className="move-btn"
          disabled={day >= TOTAL_DAYS}
          onClick={() => onMove(day + 1)}
        >
          {day < TOTAL_DAYS ? `${day + 1}일차` : '마지막 날'}
          <ChevronRight size={20} />
        </button>
      </div>
    </>
  );
}
