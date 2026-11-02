# 히트펌프119 — 히트펌프 설치 홍보 페이지

정적 원페이지입니다. 배포: https://heatpump119.vercel.app/ (GitHub main 푸시 시 Vercel 자동 배포)

## 파일
- `index.html` — 화면, 메타 태그, 구조화 데이터(JSON-LD)
- `app.js` — 계산기·상담 신청·카톡 버튼 (전화번호·카톡·계산 기준 설정은 맨 위)
- `redirect.js` — 예전 github.io 주소로 오면 새 주소로 이동
- `vercel.json` — 보안 헤더(CSP 등)·캐시 설정
- `og-image.png`, `favicon.svg`, `*.png`, `site.webmanifest` — 공유 이미지·아이콘
- `googleaf2f7a02f69b238e.html`, index.html 의 naver-site-verification — 검색 등록 인증 (지우지 말 것)

## 바꿔야 할 때
- 전화번호: `index.html`, `app.js` 둘 다 일괄 변경
- 카카오톡: `app.js` 의 `KAKAO_URL` (비우면 버튼 숨김)
- 도메인: canonical, og:url, og:image, JSON-LD, `sitemap.xml`, `robots.txt`, `redirect.js`
- 외부 스크립트·이미지를 새로 넣으면 `vercel.json` 의 Content-Security-Policy 에 주소를 추가해야 동작합니다
