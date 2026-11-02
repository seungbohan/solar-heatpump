# 히트펌프 설치 홍보 페이지

단일 HTML 원페이지입니다. `index.html` 만 열면 동작합니다.

## 바꿔야 할 곳
- 전화번호: `010-6647-2269` (tel:/sms: 링크 포함 일괄 변경, `<script>` 의 `PHONE` 도 함께)
- 카카오톡: `<script>` 맨 위 `KAKAO_URL` 에 채널 주소를 넣으면 카톡 버튼이 나타남
- 계산 기준: `<script>` 의 `OIL_PRICE`, `COP_LOW`/`COP_HIGH`, `TYPES` 의 전기 단가
- 도메인: `sitemap.xml` 과 `robots.txt` 의 `example.com`, `index.html` 의 JSON-LD `url`
