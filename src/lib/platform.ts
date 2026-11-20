/**
 * 웹사이트 버전(`npm run build:web`)으로 빌드했는지. 빌드할 때 값이 정해져서,
 * 토스 미니앱 빌드에서는 웹 전용 코드가 통째로 빠진다.
 */
export const IS_WEB = import.meta.env.MODE === 'web';
