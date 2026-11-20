import { Device, SafeArea, Share, User, graniteEvent } from '@apps-in-toss/web-framework';

/**
 * 하단 안전 영역(아이폰 홈 인디케이터 등) 높이를 CSS 변수 --safe-bottom에 넣는다.
 * 토스 앱에서는 SDK 값을 쓰고, 값을 못 받으면(웹 등) CSS의 env(safe-area-inset-bottom)을 그대로 쓴다.
 */
export function watchSafeAreaBottom(): () => void {
  const apply = (bottom: unknown) => {
    if (typeof bottom === 'number') document.documentElement.style.setProperty('--safe-bottom', `${bottom}px`);
  };
  try {
    apply(SafeArea.get()?.bottom);
    return SafeArea.subscribe({ onEvent: (insets) => apply(insets?.bottom) });
  } catch {
    return () => {};
  }
}

/** 진동 설정이 꺼져 있거나 지원하지 않으면 조용히 넘어간다(토스트는 따로 뜬다). */
export async function hapticSuccess() {
  try {
    await Device.triggerHaptic({ type: 'success' });
  } catch {
    // no-op
  }
}

export async function shareText(message: string): Promise<boolean> {
  try {
    await Share.sendMessage({ message });
    return true;
  } catch {
    return false;
  }
}

/** 등록하는 동안 플랫폼 기본 뒤로가기는 막힌다. 루트 화면에서는 등록하지 않는다. */
export function onBack(handler: () => void): () => void {
  try {
    return graniteEvent.addEventListener('backEvent', { onEvent: handler, onError: () => {} });
  } catch {
    return () => {};
  }
}

/**
 * 미니앱 안에서 이 사용자를 구분하는 익명 키(hash). 앱 버전이 낮거나 실패하면 null.
 * 처음 한 번만 받아 저장 상태에 함께 둔다(출시 체크리스트 '사용자 식별키 발급').
 */
export async function getUserKey(): Promise<string | null> {
  try {
    if (!User.getAnonymousKey.isSupported()) return null;
    const res = await User.getAnonymousKey();
    return res.type === 'HASH' ? res.hash : null;
  } catch {
    return null;
  }
}
