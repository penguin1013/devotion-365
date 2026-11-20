import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import aitDevtools from "@apps-in-toss/devtools/unplugin";

/** 웹사이트 버전 주소(Netlify). 주소를 바꾸면 여기도 바꾼다. */
const WEB_URL = 'https://devotion-365.netlify.app'

/** 웹 로딩 화면: 흰 바탕에 교회 로고와 앱 이름만 작게. App.tsx의 불러오는 중 화면도 같은 클래스를 쓴다. */
const WEB_SPLASH =
  '<div class="web-splash" role="status" aria-label="불러오는 중"><img src="./logo-mark.png" alt="" width="48" height="52"><span>365일 묵상집</span></div>'
const WEB_SPLASH_CSS = `
.web-splash{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding-bottom:6vh;background:#fff;animation:web-splash-in .5s ease-out both}
.web-splash img{display:block;width:48px;height:auto}
.web-splash span{font-family:'Pretendard Variable',Pretendard,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',system-ui,sans-serif;font-size:15px;font-weight:600;letter-spacing:-0.2px;color:#4e5968}
@keyframes web-splash-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.web-splash{animation:none}}
`

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 웹사이트 버전: `npm run build:web` / `npm run dev:web`
  // 토스 SDK 대신 src/platform/web-shim.ts를 쓰고, 결과물은 dist-web/에 만든다.
  if (mode === 'web') {
    return {
      plugins: [
        react(),
        {
          // 홈 화면에 추가할 때 쓰는 아이콘·앱 정보. 토스 빌드에는 넣지 않는다.
          name: 'devotion-web-head',
          transformIndexHtml: (html) => ({
            html: html
              // 아이폰 홈 화면 앱에서 하단 안전 영역 값을 받으려면 viewport-fit=cover가 필요하다
              .replace('user-scalable=no"', 'user-scalable=no, viewport-fit=cover"')
              // JS가 뜨기 전에 보이는 로딩 화면. 앱이 뜨면 React가 이 내용을 바꿔 끼운다.
              .replace('<div id="root"></div>', `<div id="root">${WEB_SPLASH}</div>`),
            tags: [
            { tag: 'style', children: WEB_SPLASH_CSS, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'description', content: '하루 한 편, 1년 동안 말씀을 묵상하는 365일 묵상집' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'theme-color', content: '#ffffff' }, injectTo: 'head' },
            { tag: 'link', attrs: { rel: 'manifest', href: './manifest.webmanifest' }, injectTo: 'head' },
            { tag: 'link', attrs: { rel: 'icon', type: 'image/png', href: './favicon-32.png' }, injectTo: 'head' },
            { tag: 'link', attrs: { rel: 'apple-touch-icon', href: './apple-touch-icon.png' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: '365일 묵상집' }, injectTo: 'head' },
            // 카카오톡·문자 등으로 링크를 보낼 때 보이는 미리보기. 이미지 주소는 전체 주소여야 한다.
            { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:url', content: `${WEB_URL}/` }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:site_name', content: '365일 묵상집' }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:title', content: '365일 묵상집' }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:description', content: '하루 한 편 말씀을 읽고, 마음에 남은 것을 기록해요' }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:image', content: `${WEB_URL}/og-image.png` }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            ],
          }),
        },
      ],
      base: './',
      publicDir: 'web-public',
      resolve: {
        alias: {
          '@apps-in-toss/web-framework': fileURLToPath(new URL('./src/platform/web-shim.ts', import.meta.url)),
        },
      },
      build: { outDir: 'dist-web' },
    }
  }

  return {
    plugins: [aitDevtools.vite(), react()],
  }
})
