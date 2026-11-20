import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import './styles/app.css';
import { Dialog, TabBar, Toast, type Tab } from './components/ui';
import { TOTAL_DAYS, loadDays } from './content/days';
import { todayYmd } from './lib/date';
import { getUserKey, hapticSuccess, onBack, shareText } from './lib/sdk';
import {
  FONT_SCALE,
  computeStats,
  exportText,
  initialState,
  loadState,
  saveState,
  type UserState,
} from './lib/state';
import { CalendarScreen } from './screens/CalendarScreen';
import { DayScreen } from './screens/DayScreen';
import { Onboarding } from './screens/Onboarding';
import { RecordsScreen } from './screens/RecordsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TodayScreen } from './screens/TodayScreen';
import { WriteScreen } from './screens/WriteScreen';

type Route = { name: 'write'; day: number } | { name: 'day'; day: number } | { name: 'settings' };

export default function App() {
  const [state, setState] = useState<UserState | null>(null);
  const [today, setToday] = useState(todayYmd);
  const [tab, setTab] = useState<Tab>('today');
  const [stack, setStack] = useState<Route[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const writeDirty = useRef(false);

  useEffect(() => {
    void Promise.all([loadState(), loadDays()]).then(async ([s]) => {
      setState(s);
      // 식별키는 처음 한 번만 받아 저장한다. 받지 못해도 앱은 그대로 쓸 수 있다.
      if (!s.userKey) {
        const userKey = await getUserKey();
        if (userKey) {
          setState((prev) => {
            const next = { ...(prev ?? s), userKey };
            void saveState(next);
            return next;
          });
        }
      }
    });
  }, []);

  // 자정(Asia/Seoul)이 지나면 일차가 넘어가도록 다시 계산한다
  useEffect(() => {
    const refresh = () => setToday(todayYmd());
    const timer = setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  const update = useCallback((fn: (s: UserState) => UserState) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      void saveState(next);
      return next;
    });
  }, []);

  const top = stack[stack.length - 1];
  const push = (r: Route) => setStack((s) => [...s, r]);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  const goBack = useCallback(() => {
    if (top?.name === 'write' && writeDirty.current) {
      setLeaveConfirm(true);
      return;
    }
    if (top) pop();
    else setTab('today');
  }, [top, pop]);

  // 오늘 탭이 루트다. 루트에서는 등록하지 않아 플랫폼 뒤로가기가 미니앱을 닫는다.
  const canGoBack = stack.length > 0 || tab !== 'today';
  useEffect(() => {
    if (!state?.startDate || !canGoBack) return;
    return onBack(goBack);
  }, [state?.startDate, canGoBack, goBack]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, stack.length, top]);

  const setDirty = useCallback((d: boolean) => {
    writeDirty.current = d;
  }, []);

  if (!state) return <div className="canvas bg-canvas" />;

  const scaleStyle = { '--read-scale': FONT_SCALE[state.fontScale] } as CSSProperties;

  if (!state.startDate) {
    return (
      <div className="app" style={scaleStyle}>
        <Onboarding today={today} onStart={(start) => update((s) => ({ ...s, startDate: start }))} />
      </div>
    );
  }

  const stats = computeStats(state, today);
  const openDay = (day: number) => push({ name: 'day', day: Math.min(Math.max(day, 1), TOTAL_DAYS) });
  const openWrite = (day: number) => {
    writeDirty.current = false;
    push({ name: 'write', day });
  };
  const markRead = (day: number) => {
    if (day > stats.todayIdx) return;
    update((s) =>
      s.records[day] ? s : { ...s, records: { ...s.records, [day]: { status: 'read', updatedAt: new Date().toISOString() } } },
    );
  };
  const goTodayTab = () => {
    setStack([]);
    setTab('today');
  };

  let body;
  if (top?.name === 'write') {
    const day = top.day;
    body = (
      <WriteScreen
        key={day}
        day={day}
        record={state.records[day]}
        onDirtyChange={setDirty}
        onSave={(note, tags) => {
          update((s) => ({
            ...s,
            records: { ...s.records, [day]: { status: 'done', note, tags, updatedAt: new Date().toISOString() } },
          }));
          writeDirty.current = false;
          pop();
          void hapticSuccess();
          setToast(`${day}일차 묵상을 기록했어요`);
        }}
        onDelete={() => {
          // 글을 읽은 기록은 남기고 느낀점·태그만 지운다(완료 → 미완료)
          update((s) => ({
            ...s,
            records: { ...s.records, [day]: { status: 'read', updatedAt: new Date().toISOString() } },
          }));
          writeDirty.current = false;
          pop();
          setToast(`${day}일차 기록을 지웠어요`);
        }}
      />
    );
  } else if (top?.name === 'day') {
    body = (
      <DayScreen
        day={top.day}
        state={state}
        todayIdx={stats.todayIdx}
        onMove={(day) => setStack((s) => [...s.slice(0, -1), { name: 'day', day }])}
        onWrite={openWrite}
        onRead={markRead}
        onBackToToday={goTodayTab}
      />
    );
  } else if (top?.name === 'settings') {
    body = (
      <SettingsScreen
        state={state}
        today={today}
        onChangeStart={(d) => {
          update((s) => ({ ...s, startDate: d }));
          setToast('시작일을 바꿨어요');
        }}
        onChangeScale={(fontScale) => update((s) => ({ ...s, fontScale }))}
        onExport={async () => {
          const ok = await shareText(exportText(state));
          if (!ok) setToast('공유 화면을 열지 못했어요. 잠시 후 다시 시도해 주세요');
        }}
        onReset={() => {
          update(() => initialState);
          setStack([]);
          setTab('today');
        }}
      />
    );
  } else {
    body = (
      <div className="screen with-tabbar">
        {tab === 'today' && (
          <TodayScreen
            state={state}
            today={today}
            stats={stats}
            onWrite={openWrite}
            onOpenDay={openDay}
            onOpenSettings={() => push({ name: 'settings' })}
            onOpenRecords={() => setTab('records')}
            onRead={markRead}
          />
        )}
        {tab === 'calendar' && (
          <CalendarScreen
            state={state}
            today={today}
            stats={stats}
            onOpenDay={openDay}
            onOpenSettings={() => push({ name: 'settings' })}
          />
        )}
        {tab === 'records' && <RecordsScreen state={state} onOpenDay={openDay} onGoToday={goTodayTab} />}
        <TabBar tab={tab} onChange={setTab} />
      </div>
    );
  }

  return (
    <div className="app" style={scaleStyle}>
      {body}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      {leaveConfirm && (
        <Dialog
          title="작성 중인 내용이 사라져요"
          description="지금 나가면 쓰던 느낀점이 저장되지 않아요."
          cancelLabel="계속 쓰기"
          confirmLabel="나가기"
          danger
          onCancel={() => setLeaveConfirm(false)}
          onConfirm={() => {
            setLeaveConfirm(false);
            writeDirty.current = false;
            pop();
          }}
        />
      )}
    </div>
  );
}
