import { useEffect, type ReactNode } from 'react';
import { Close } from './icons';
import { BookIcon, CalendarIcon, ListIcon } from './appIcons';

export type Tab = 'today' | 'calendar' | 'records';

const TABS: { id: Tab; label: string; Icon: typeof BookIcon }[] = [
  { id: 'today', label: '오늘', Icon: BookIcon },
  { id: 'calendar', label: '달력', Icon: CalendarIcon },
  { id: 'records', label: '기록', Icon: ListIcon },
];

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="메뉴">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`tab ${tab === id ? 'is-on' : ''}`}
          aria-current={tab === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <span className="tab-icon">
            <Icon size={22} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`진행률 ${pct}%`}>
      <svg viewBox="0 0 36 36" width={size} height={size} aria-hidden="true">
        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--app-sep)" strokeWidth="3.5" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${Math.max(pct, 1)} 100`}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="ring-label">{pct}%</span>
    </div>
  );
}

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

type DialogProps = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function Dialog({ title, description, confirmLabel, cancelLabel, danger, onConfirm, onCancel }: DialogProps) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dialog-title" className="dialog-title">
          {title}
        </h2>
        {description && <p className="dialog-desc">{description}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="overlay overlay-bottom" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-head">
          <h2 id="sheet-title" className="sheet-title">
            {title}
          </h2>
          <button type="button" className="icon-btn" aria-label="닫기" onClick={onClose}>
            <Close size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
