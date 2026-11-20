import { useEffect, useMemo, useState } from 'react';
import { BookIcon } from '../components/appIcons';
import { TAGS, getEntry } from '../content/days';
import type { DayRecord } from '../lib/state';

const MAX = 1000;

type Props = {
  day: number;
  record?: DayRecord;
  onSave: (note: string, tags: string[]) => void;
  onDirtyChange: (dirty: boolean) => void;
};

export function WriteScreen({ day, record, onSave, onDirtyChange }: Props) {
  const entry = getEntry(day);
  const [note, setNote] = useState(record?.note ?? '');
  const [tags, setTags] = useState<string[]>(record?.tags ?? []);
  const editing = record?.status === 'done';

  const dirty = useMemo(
    () => note !== (record?.note ?? '') || tags.join() !== (record?.tags ?? []).join(),
    [note, tags, record],
  );
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const canSave = note.trim().length > 0 || tags.length > 0;
  const firstLine = entry.verse.text.split('\n')[0];

  const toggle = (id: string) => setTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  return (
    <div className="screen screen-plain">
      <main className="content">
        <div className="verse-quote">
          <span className="verse-quote-icon">
            <BookIcon size={20} />
          </span>
          <div>
            <p className="verse-quote-ref">
              {day}일차 · {entry.verse.ref}
            </p>
            <p className="verse-quote-text">{firstLine}…</p>
          </div>
        </div>

        <label htmlFor="note" className="question">
          {entry.question}
        </label>
        <p className="meta">짧게 한 줄이어도 괜찮아요</p>

        <textarea
          id="note"
          className="note-input read-scale"
          value={note}
          maxLength={MAX}
          rows={7}
          placeholder="마음에 남은 말씀이나 생각을 적어 보세요"
          onChange={(e) => setNote(e.target.value)}
        />
        <p className="counter" aria-live="polite">
          {note.length.toLocaleString()} / {MAX.toLocaleString()}
        </p>

        <fieldset className="tags">
          <legend className="eyebrow">오늘의 마음</legend>
          <div className="chips">
            {TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`chip ${tags.includes(t.id) ? 'is-on' : ''}`}
                aria-pressed={tags.includes(t.id)}
                onClick={() => toggle(t.id)}
              >
                <span className="tf">{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>
        </fieldset>
      </main>
      <div className="dock dock-safe dock-plain">
        <button
          type="button"
          className="btn btn-primary btn-cta"
          disabled={!canSave}
          onClick={() => onSave(note.trim(), tags)}
        >
          {editing ? '수정한 내용 저장하기' : `기록하고 ${day}일차 완료`}
        </button>
      </div>
    </div>
  );
}
