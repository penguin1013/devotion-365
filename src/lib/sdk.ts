import { Device, Share, User, graniteEvent } from '@apps-in-toss/web-framework';

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
