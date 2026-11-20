/**
 * 웹사이트 버전(`npm run build:web`)에서 '@apps-in-toss/web-framework' 대신 쓰는 대체 모듈.
 * vite.config.ts가 web 모드일 때만 이 파일로 바꿔 끼운다. 토스 미니앱 빌드에는 들어가지 않는다.
 * 앱 코드(src/lib/sdk.ts, src/lib/state.ts)가 쓰는 API만 같은 모양으로 흉내 낸다.
 */

/** 기록은 이 브라우저의 localStorage에 둔다. */
export const Storage = {
  async getItem(key: string): Promise<string | null> {
    return window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    window.localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    window.localStorage.removeItem(key);
  },
};

export const Device = {
  async triggerHaptic(): Promise<void> {
    navigator.vibrate?.(30);
  },
};

export const Share = {
  /** 휴대폰 기본 공유 창을 연다. 공유 창이 없는 PC 브라우저는 클립보드에 복사한다. */
  async sendMessage({ message }: { message: string }): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
      } catch (e) {
        // 사용자가 공유 창을 닫은 것은 실패가 아니다
        if (e instanceof DOMException && e.name === 'AbortError') return;
        throw e;
      }
      return;
    }
    await navigator.clipboard.writeText(message);
    window.alert('기록을 복사했어요. 메모 앱이나 대화방에 붙여 넣어 보관하세요.');
  },
};

/** 웹에는 토스 사용자 식별키가 없다. 앱은 키 없이도 그대로 동작한다. */
const getAnonymousKey = Object.assign(async () => ({ type: 'NONE' as const }), {
  isSupported: () => false,
});
export const User = { getAnonymousKey };

/*
 * 뒤로가기: 하위 화면이 열려 있는 동안 브라우저 기록에 한 칸을 넣어 두고,
 * 휴대폰·브라우저의 뒤로가기가 그 칸을 지우면 앱 안의 뒤로가기를 대신 실행한다.
 * 그래서 하위 화면에서 뒤로가기를 눌러도 사이트를 벗어나지 않는다.
 */
let backHandler: (() => void) | null = null;
let guarded = false;

function pushGuard() {
  if (guarded) return;
  history.pushState({ devotionBackGuard: true }, '');
  guarded = true;
}

window.addEventListener('popstate', () => {
  guarded = false;
  const handler = backHandler;
  if (!handler) return;
  handler();
  // 처리 뒤에도 하위 화면이 남아 있으면(또는 나가기 확인 창이 뜨면) 다시 한 칸 넣는다
  setTimeout(() => {
    if (backHandler) pushGuard();
  }, 0);
});

export const graniteEvent = {
  addEventListener(_event: 'backEvent', { onEvent }: { onEvent: () => void; onError?: () => void }) {
    backHandler = onEvent;
    pushGuard();
    return () => {
      if (backHandler === onEvent) backHandler = null;
    };
  },
};
