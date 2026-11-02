/* 히트펌프 페이지 스크립트 — 설정(전화번호·카톡·계산 기준)은 맨 위에서 바꾸세요 */
(function(){
  /* ============================================================
     설정 — 여기만 고치면 됩니다
     ============================================================ */
  var PHONE     = '01066472269';  // 상담 문자 받을 번호
  var KAKAO_URL = '';             // 카카오톡 채널 주소. 비워 두면 카톡 버튼이 숨겨집니다.
                                  // 사업자 인증 후 'https://pf.kakao.com/_VIxkWX/chat' 다시 넣기

  /* 계산 기준 — 지금 연료비 대비 절감 비율 (하한, 상한) */
  var FUELS = {
    oil: { name: '기름보일러', bill: '기름값',   save: [0.5, 0.6] },  // 50~60% 절감
    gas: { name: '가스보일러', bill: '가스요금', save: [0.4, 0.5] }   // 40~50% 절감
  };

  var TYPES = {
    home: {
      name: '가정집', period: '한겨울 한 달', fuels: ['oil'],
      months: 3, periodName: '겨울 석 달이면',
      note: ''
    },
    stay: {
      name: '숙박업', period: '한 달 평균', fuels: ['oil', 'gas'],
      months: 12, periodName: '1년이면',
      note: ' 온수를 1년 내내 쓰는 것으로 보고 1년 값을 냈습니다.'
    },
    bath: {
      name: '목욕탕', period: '한 달 평균', fuels: ['oil', 'gas'],
      months: 12, periodName: '1년이면',
      note: ' 1년 내내 영업하는 것으로 보고 1년 값을 냈습니다.'
    }
  };
  var TYPE_TO_APPLY = { home:'가정집 (단독주택)', stay:'숙박업', bath:'목욕탕·사우나' };

  function pct(f){ return Math.round(f.save[0] * 100) + '~' + Math.round(f.save[1] * 100) + '%'; }

  var $ = function(id){ return document.getElementById(id); };
  var input = $('amount');
  var last = null;   // 마지막 계산 결과 (상담 신청 문자에 같이 보냄)

  /* 원 → "13" / "1,140" / "1억 1,600" (뒤에 '만원'을 붙여 씀) */
  function m(won){
    var v = won / 10000;
    if (v < 10)   return String(Math.round(v * 10) / 10);
    if (v < 1000) return Math.round(v).toLocaleString('ko-KR');
    v = Math.round(v / 10) * 10;                      // 천만원 이상은 10만원 단위
    if (v < 10000) return v.toLocaleString('ko-KR');
    var eok = Math.floor(v / 10000), rest = v % 10000;
    return eok + '억' + (rest ? ' ' + rest.toLocaleString('ko-KR') : '');
  }
  function range(a, b){
    var lo = m(Math.min(a, b)), hi = m(Math.max(a, b));
    return lo === hi ? '약 ' + lo + '만원' : '약 ' + lo + '~' + hi + '만원';
  }

  function calc(){
    var key = document.querySelector('input[name="type"]:checked').value;
    var t = TYPES[key];
    var multi = t.fuels.length > 1;
    $('fuel-field').hidden = !multi;
    var fkey = multi ? document.querySelector('input[name="fuel"]:checked').value : t.fuels[0];
    var f = FUELS[fkey];
    var label = t.period + ' ' + f.bill;

    $('amount-label').textContent = label;
    $('basis').textContent = t.name + ' 기준: ' + f.name + ' 대비 난방비 ' + pct(f) +
      ' 절감으로 계산한 예상치입니다.' + t.note + ' 실제 절감액은 히트펌프 효율·전기요금·사용량에 따라 달라집니다.';
    $('a-type').value = TYPE_TO_APPLY[key] + (multi ? ' · ' + f.name : '');

    var amount = parseInt(input.value, 10);
    if (!amount) { $('result').hidden = true; last = null; syncApply(); return; }

    var now    = amount * 10000;
    var saveLo = now * f.save[0];
    var saveHi = now * f.save[1];

    $('result').hidden = false;
    $('r-big').textContent  = range(saveLo, saveHi) + ' 절약';
    $('r-now-name').textContent = '지금 난방비 (' + f.name + ')';
    $('r-now').textContent  = amount.toLocaleString('ko-KR') + '만원';
    $('r-hp').textContent   = range(now - saveHi, now - saveLo);
    $('r-period-name').textContent = t.periodName;
    $('r-period').textContent = range(saveLo * t.months, saveHi * t.months) + ' 절약';

    last = t.name + ' · ' + label + ' ' + amount.toLocaleString('ko-KR') + '만원 → 한 달 ' + range(saveLo, saveHi) + ' 절약 예상';
    syncApply();
  }
  function syncApply(){
    $('a-calc').hidden = !last;
    if (last) $('a-calc').textContent = '계산 결과도 함께 보냅니다: ' + last;
  }

  input.addEventListener('input', function(){
    var clean = input.value.replace(/[^0-9]/g, '').slice(0, 5);
    if (input.value !== clean) input.value = clean;
    calc();
  });
  $('calc').addEventListener('change', calc);
  $('calc').addEventListener('submit', function(e){ e.preventDefault(); input.blur(); });

  /* ---------- 상담 신청 → 문자 앱 열기 ---------- */
  $('apply-form').addEventListener('submit', function(e){
    e.preventDefault();
    var name  = $('a-name').value.trim();
    var phone = $('a-phone').value.replace(/[^0-9]/g, '');
    var err = '';
    if (!name) err = '성함을 적어 주세요.';
    else if (phone.length < 9) err = '연락처를 정확히 적어 주세요.';
    $('a-err').hidden = !err;
    $('a-err').textContent = err;
    if (err) return;

    var lines = [
      '[히트펌프 상담 신청]',
      '성함: ' + name,
      '연락처: ' + phone,
      '지역: ' + ($('a-region').value || '미선택'),
      '설치 장소: ' + $('a-type').value
    ];
    if (last) lines.push('계산: ' + last);
    var memo = $('a-memo').value.trim();
    if (memo) lines.push('메모: ' + memo);

    location.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(lines.join('\n'));
  });

  /* ---------- 카톡 버튼 ---------- */
  if (KAKAO_URL) {
    [].forEach.call(document.querySelectorAll('.js-kakao'), function(a){ a.href = KAKAO_URL; a.hidden = false; });
  }

  calc();
})();
