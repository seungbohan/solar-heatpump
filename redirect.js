/* 예전 주소(github.io)로 들어오면 새 주소로 보냅니다 */
if (/\.github\.io$/.test(location.hostname)) {
  location.replace('https://heatpump119.vercel.app/' + location.search + location.hash);
}
