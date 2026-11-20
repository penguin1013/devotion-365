import { useState } from 'react';
import { Dialog, Sheet } from '../components/ui';
import { ChevronRight } from '../components/icons';
import { fmtDot } from '../lib/date';
import { IS_WEB } from '../lib/platform';
import type { FontScale, UserState } from '../lib/state';
import { StartPicker, StartSummary } from './Onboarding';

const SCALES: { id: FontScale; label: string }[] = [
  { id: 'md', label: '보통' },
  { id: 'lg', label: '크게' },
  { id: 'xl', label: '아주 크게' },
];

type Props = {
  state: UserState;
  today: string;
  onChangeStart: (d: string) => void;
  onChangeScale: (s: FontScale) => void;
  onExport: () => void;
  onReset: () => void;
};

export function SettingsScreen({ state, today, onChangeStart, onChangeScale, onExport, onReset }: Props) {
  const start = state.startDate!;
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState(start);
  const [confirmReset, setConfirmReset] = useState(false);
  const hasNotes = Object.values(state.records).some((r) => r.note || r.tags?.length);

  return (
    <div className="screen">
      <main className="content">
        <h1 className="display">설정</h1>

        <section className="group">
          <h2 className="group-title">묵상 시작일</h2>
          <button
            type="button"
            className="card row-card"
            onClick={() => {
              setDraft(start);
              setPicking(true);
            }}
          >
            <span className="row-body">
              <span className="row-title">{fmtDot(start)}</span>
              <span className="row-sub">이 날이 1일차예요</span>
            </span>
            <span className="row-action">바꾸기</span>
            <span className="row-chevron">
              <ChevronRight size={20} />
            </span>
          </button>
        </section>

        <section className="group">
          <h2 className="group-title">글자 크기</h2>
          <div className="card">
            <div className="segmented" role="radiogroup" aria-label="글자 크기">
              {SCALES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={state.fontScale === s.id}
                  className={`segment ${state.fontScale === s.id ? 'is-on' : ''}`}
                  onClick={() => onChangeScale(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="scale-preview read-scale">주의 말씀은 내 발에 등이요 내 길에 빛이니이다</p>
          </div>
        </section>

        <section className="group">
          <h2 className="group-title">데이터</h2>
          <div className="card list-card">
            <button type="button" className="list-row" disabled={!hasNotes} onClick={onExport}>
              <span className="row-body">
                <span className="row-title">느낀점 내보내기</span>
                <span className="row-sub">
                  {hasNotes ? '공유하기로 메모 앱이나 대화방에 보관해요' : '아직 내보낼 느낀점이 없어요'}
                </span>
              </span>
              <span className="row-chevron">
                <ChevronRight size={20} />
              </span>
            </button>
            <button type="button" className="list-row" onClick={() => setConfirmReset(true)}>
              <span className="row-body">
                <span className="row-title danger">모든 기록 지우기</span>
                <span className="row-sub">시작일과 느낀점이 모두 지워져요</span>
              </span>
              <span className="row-chevron">
                <ChevronRight size={20} />
              </span>
            </button>
          </div>
          <p className="footnote">
            {IS_WEB
              ? '기록은 이 휴대폰의 브라우저에만 저장돼요. 브라우저의 방문 기록과 사이트 데이터를 지우면 기록도 함께 지워지니, 가끔 내보내기로 따로 보관해 두세요.'
              : '기록은 이 휴대폰에만 저장돼요. 토스 앱을 지우면 기록도 함께 지워지니, 가끔 내보내기로 따로 보관해 두세요.'}
          </p>
        </section>
      </main>

      {picking && (
        <Sheet title="시작일 바꾸기" onClose={() => setPicking(false)}>
          <p className="sheet-desc">일차 계산이 바뀌어요. 기존 기록은 일차 그대로 유지돼요.</p>
          <StartPicker value={draft} today={today} onChange={setDraft} />
          <StartSummary start={draft} />
          <div className="sheet-actions">
            <button
              type="button"
              className="btn btn-primary btn-cta"
              disabled={draft === start}
              onClick={() => {
                onChangeStart(draft);
                setPicking(false);
              }}
            >
              이 날로 바꾸기
            </button>
          </div>
        </Sheet>
      )}

      {confirmReset && (
        <Dialog
          title="모든 기록을 지울까요?"
          description="시작일과 남긴 느낀점이 모두 지워지고 되돌릴 수 없어요."
          cancelLabel="취소"
          confirmLabel="지우기"
          danger
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            setConfirmReset(false);
            onReset();
          }}
        />
      )}
    </div>
  );
}
