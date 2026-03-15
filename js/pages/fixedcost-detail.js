(function () {
  const { clampNumber, formatWon, constants } = window.LifeCalcUtils;

  function initFixedCostDetailPage() {
    const ids = [
      "fixedcostDetailRent",
      "fixedcostDetailPayroll",
      "fixedcostDetailUtilities",
      "fixedcostDetailSoftware",
      "fixedcostDetailMarketing",
      "fixedcostDetailDepreciation",
      "fixedcostDetailReserve",
      "fixedcostDetailOther",
    ];
    const inputs = ids.map((id) => document.getElementById(id));
    const result = document.getElementById("fixedcostDetailResult");

    if (inputs.some((input) => !input) || !result) {
      return;
    }

    const render = () => {
      const values = inputs.map((input) => clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
      const total = values.reduce((sum, value) => sum + value, 0);
      const yearly = total * 12;
      const daily = total / 30;

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary"><span>월 고정비 합계</span><strong>${formatWon(total)}</strong><p>매달 반복되거나 미리 잡아두는 운영비 전체 합계입니다.</p></article>
          <article class="premium-payslip-summary"><span>연간 운영비</span><strong>${formatWon(yearly)}</strong><p>현재 월 고정비가 1년 유지된다고 가정한 연간 금액입니다.</p></article>
          <article class="premium-payslip-summary"><span>하루 기준 부담</span><strong>${formatWon(daily)}</strong><p>월 고정비를 30일 기준으로 나눠 본 하루 평균 부담입니다.</p></article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>핵심 고정비</h4>
            <dl class="premium-breakdown-list">
              <div><dt>임대료</dt><dd>${formatWon(values[0])}</dd></div>
              <div><dt>인건비</dt><dd>${formatWon(values[1])}</dd></div>
              <div><dt>관리비/공과금</dt><dd>${formatWon(values[2])}</dd></div>
              <div><dt>구독/소프트웨어</dt><dd>${formatWon(values[3])}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>추가 운영비</h4>
            <dl class="premium-breakdown-list">
              <div><dt>마케팅비</dt><dd>${formatWon(values[4])}</dd></div>
              <div><dt>감가상각</dt><dd>${formatWon(values[5])}</dd></div>
              <div><dt>예비비</dt><dd>${formatWon(values[6])}</dd></div>
              <div><dt>기타 비용</dt><dd>${formatWon(values[7])}</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    inputs.forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["fixedcost-detail"] = initFixedCostDetailPage;
})();
