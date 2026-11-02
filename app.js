/* 히트펌프 페이지 스크립트 — 설정(전화번호·카톡·계산 기준)은 맨 위에서 바꾸세요 */
(function(){
  /* ============================================================
     설정 — 여기만 고치면 됩니다
     ============================================================ */
  var PHONE     = '01066472269';  // 상담 문자 받을 번호
  var KAKAO_URL = '';             // 카카오톡 채널 주소. 비워 두면 카톡 버튼이 숨겨집니다.
                                  // 사업자 인증 후 'https://pf.kakao.com/_VIxkWX/chat' 다시 넣기

  /* 계산 기준 */
  var OIL_PRICE   = 208.4;  // 등유 원 / 1,000kcal (연료 열량 기준)
  var BOILER_EFF  = 0.85;   // 기름보일러 효율
  var COP_LOW     = 2;      // 히트펌프 효율 하한 (한파·고온수)
  var COP_HIGH    = 3;      // 히트펌프 효율 상한

  var TYPES = {
    home: {
      name: '가정집', label: '한겨울 한 달 기름값',
      elec: 215,                  // 주택용 전기 1kWh (원, 고정 단가)
      months: 3, periodName: '겨울 석 달이면',
      basis: '가정집 기준: 등유 208.4원(1,000kcal당), 기름보일러 효율 85%, 히트펌프 효율 2~3배, 전기 1kWh당 215원으로 계산한 예상치입니다.'
    },
    stay: {
      name: '숙박업', label: '한 달 평균 기름값',
      elec: 150,                  // 일반용(갑) 저압 겨울 전력량요금 + 부가 요금·세금
      months: 12, periodName: '1년이면',
      basis: '숙박업 기준: 등유 208.4원(1,000kcal당), 보일러 효율 85%, 히트펌프 효율 2~3배, 일반용 전기 1kWh당 150원(계약전력 기본요금 별도)으로 계산한 예상치입니다. 온수를 1년 내내 쓰는 것으로 보고 1년 값을 냈습니다.'
    },
    bath: {
      name: '목욕탕', label: '한 달 평균 기름값',
      elec: 150,
      months: 12, periodName: '1년이면',
      basis: '목욕탕 기준: 등유 208.4원(1,000kcal당), 보일러 효율 85%, 히트펌프 효율 2~3배, 일반용 전기 1kWh당 150원(계약전력 기본요금 별도)으로 계산한 예상치입니다. 1년 내내 영업하는 것으로 보고 1년 값을 냈습니다.'
    }
  };
  var TYPE_TO_APPLY = { home:'가정집 (단독주택)', stay:'숙박업', bath:'목욕탕·사우나' };

  /* 기름값(원) → 같은 열을 히트펌프로 냈을 때 전기료(원) */
  function heatPumpCost(won, cop, elec){
    var heatKcal = won / OIL_PRICE * 1000 * BOILER_EFF; // 실제로 쓰인 열
    return heatKcal / 860 / cop * elec;                 // 860kcal = 1kWh
  }

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
    $('amount-label').textContent = t.label;
    $('basis').textContent = t.basis;
    $('a-type').value = TYPE_TO_APPLY[key];

    var amount = parseInt(input.value, 10);
    if (!amount) { $('result').hidden = true; last = null; syncApply(); return; }

    var now    = amount * 10000;
    var hpHigh = heatPumpCost(now, COP_LOW,  t.elec);  // 효율 낮을 때 (비쌈)
    var hpLow  = heatPumpCost(now, COP_HIGH, t.elec);  // 효율 높을 때 (쌈)
    var saveLo = Math.max(0, now - hpHigh);
    var saveHi = Math.max(0, now - hpLow);

    $('result').hidden = false;
    $('r-big').textContent  = range(saveLo, saveHi) + ' 절약';
    $('r-now').textContent  = amount.toLocaleString('ko-KR') + '만원';
    $('r-hp').textContent   = range(hpLow, hpHigh);
    $('r-period-name').textContent = t.periodName;
    $('r-period').textContent = range(saveLo * t.months, saveHi * t.months) + ' 절약';

    last = t.name + ' · ' + t.label + ' ' + amount.toLocaleString('ko-KR') + '만원 → 한 달 ' + range(saveLo, saveHi) + ' 절약 예상';
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
