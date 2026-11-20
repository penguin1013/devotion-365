import { useMemo, useState } from 'react';
import { Search } from '../components/icons';
import { TAGS, getEntry, tagById } from '../content/days';
import { dateOfDay, fmtShort } from '../lib/date';
import type { UserState } from '../lib/state';

type Props = {
  state: UserState;
  onOpenDay: (day: number) => void;
  onGoToday: () => void;
};

export function RecordsScreen({ state, onOpenDay, onGoToday }: Props) {
  const start = state.startDate!;
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const all = useMemo(
    () =>
      Object.keys(state.records)
        .map(Number)
        .filter((d) => state.records[d].status === 'done')
        .sort((a, b) => b - a),
    [state.records],
  );

  const items = all.filter((d) => {
    const r = state.records[d];
    if (tag && !r.tags?.includes(tag)) return false;
    const q = query.trim();
    if (!q) return true;
    const e = getEntry(d);
    return [r.note ?? '', e.verse.ref, e.title].some((s) => s.includes(q));
  });

  if (all.length === 0) {
    return (
      <main className="content">
        <h1 className="display">기록</h1>
        <div className="empty">
          <span className="empty-emoji">📝</span>
          <h2 className="title">아직 남긴 느낀점이 없어요</h2>
          <p className="lead center">오늘 말씀을 읽고 마음에 남은 것을 적어 보세요.</p>
          <button type="button" className="btn btn-secondary" onClick={onGoToday}>
            오늘 말씀 읽으러 가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="content">
      <h1 className="display">기록</h1>

      <label className="search">
        <Search size={20} />
        <input
          type="search"
          value={query}
          placeholder="느낀점이나 구절로 찾기"
          aria-label="느낀점 검색"
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <div className="chips chips-scroll" role="group" aria-label="마음 태그로 거르기">
        {TAGS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chip ${tag === t.id ? 'is-on' : ''}`}
            aria-pressed={tag === t.id}
            onClick={() => setTag(tag === t.id ? null : t.id)}
          >
            <span className="tf">{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="empty empty-compact">
          <p className="lead center">찾는 느낀점이 없어요</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setQuery('');
              setTag(null);
            }}
          >
            검색 조건 지우기
          </button>
        </div>
      ) : (
        <ul className="record-list">
          {items.map((d) => {
            const r = state.records[d];
            const e = getEntry(d);
            return (
              <li key={d}>
                <button type="button" className="card record" onClick={() => onOpenDay(d)}>
                  <span className="record-meta">
                    <span className="record-day">{d}일차</span>
                    <span className="caption">{fmtShort(dateOfDay(start, d))}</span>
                  </span>
                  <span className="record-ref">{e.verse.ref}</span>
                  {r.note && <span className="record-note">{r.note}</span>}
                  {r.tags && r.tags.length > 0 && (
                    <span className="record-tags">
                      {r.tags.map((id) => {
                        const t = tagById(id);
                        return t ? (
                          <span key={id} className="mini-tag">
                            <span className="tf">{t.emoji}</span> {t.label}
                          </span>
                        ) : null;
                      })}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
