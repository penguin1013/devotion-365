import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import aitDevtools from "@apps-in-toss/devtools/unplugin";

/** 웹사이트 버전 주소(Netlify). 주소를 바꾸면 여기도 바꾼다. */
const WEB_URL = 'https://devotion-365.netlify.app'

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
          transformIndexHtml: () => [
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
