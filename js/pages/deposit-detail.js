(function () {
  const {
    clampNumber,
    formatManwonInput,
    formatWon,
    parseManwonInput,
    formatNumber,
    constants,
  } = window.LifeCalcUtils;

  const calculateDeposit =
    (window.LifeCalcCalculators && window.LifeCalcCalculators.calculateDeposit) ||
    function fallbackCalculateDeposit(config) {
      let grossInterest = 0;
      if (config.mode === "compound") {
        const monthlyRate = config.annualRate / 12;
        const grossBalance = config.principal * (1 + monthlyRate) ** config.months;
        grossInterest = grossBalance - config.principal;
      } else {
        grossInterest = config.principal * config.annualRate * (config.months / 12);
      }
      const tax = grossInterest * config.taxRate;
      return {
        principal: config.principal,
        grossInterest,
        tax,
        netInterest: grossInterest - tax,
        netMaturity: config.payout === "monthly" ? config.principal : config.principal + grossInterest - tax,
      };
    };

  function initDepositDetailPage() {
    const principal = document.getElementById("depositDetailPrincipal");
    const baseRate = document.getElementById("depositDetailBaseRate");
    const bonusRate = document.getElementById("depositDetailBonusRate");
    const months = document.getElementById("depositDetailMonths");
    const mode = document.getElementById("depositDetailMode");
    const payout = document.getElementById("depositDetailPayout");
    const taxType = document.getElementById("depositDetailTaxType");
    const result = document.getElementById("depositDetailResult");

    if (!principal || !baseRate || !bonusRate || !months || !mode || !payout || !taxType || !result) {
      return;
    }

    const render = () => {
      const principalValue = parseManwonInput(principal.value);
      const annualRate =
        (clampNumber(baseRate.value, 0, constants.MAX_LOAN_RATE, 0) +
          clampNumber(bonusRate.value, 0, constants.MAX_LOAN_RATE, 0)) /
        100;
      const monthValue = clampNumber(months.value, 1, constants.MAX_LOAN_MONTHS, 1);
      const taxRate = taxType.value === "taxfree" ? 0 : 0.154;
      const summary = calculateDeposit({
        principal: principalValue,
        annualRate,
        months: monthValue,
        taxRate,
        mode: mode.value,
        payout: payout.value,
      });
      const monthlyPayout = monthValue > 0 ? summary.netInterest / monthValue : 0;

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary">
            <span>세후 이자</span>
            <strong>${formatWon(summary.netInterest)}</strong>
            <p>우대금리와 과세 방식을 반영해 실제 남는 이자입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>만기 시 원금 포함 금액</span>
            <strong>${formatWon(summary.netMaturity)}</strong>
            <p>${payout.value === "maturity" ? "원금과 세후 이자를 함께 받는 기준입니다." : "매월 이자를 받는 구조라 만기에는 원금만 반환됩니다."}</p>
          </article>
          <article class="premium-payslip-summary">
            <span>월 기준 세후 이자</span>
            <strong>${formatWon(monthlyPayout)}</strong>
            <p>매월 지급형으로 바꿨을 때 감각을 잡기 위한 평균값입니다.</p>
          </article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>금리와 방식</h4>
            <dl class="premium-breakdown-list">
              <div><dt>기본 금리</dt><dd>${formatNumber(baseRate.value, 1)}%</dd></div>
              <div><dt>우대 금리</dt><dd>${formatNumber(bonusRate.value, 1)}%</dd></div>
              <div><dt>총 적용 금리</dt><dd>${formatNumber((annualRate * 100).toFixed(1), 1)}%</dd></div>
              <div><dt>계산 방식</dt><dd>${mode.value === "compound" ? "월복리" : "단리"}</dd></div>
              <div><dt>이자 지급</dt><dd>${payout.value === "maturity" ? "만기 지급" : "매월 지급"}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>원금과 세금</h4>
            <dl class="premium-breakdown-list">
              <div><dt>예치 원금</dt><dd>${formatWon(summary.principal)}</dd></div>
              <div><dt>세전 이자</dt><dd>${formatWon(summary.grossInterest)}</dd></div>
              <div><dt>이자 세금</dt><dd>${formatWon(summary.tax)}</dd></div>
              <div><dt>과세 방식</dt><dd>${taxType.value === "taxfree" ? "비과세" : "일반과세"}</dd></div>
              <div><dt>예치 기간</dt><dd>${formatNumber(monthValue)}개월</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    principal.addEventListener("input", () => {
      principal.value = formatManwonInput(principal.value);
      render();
    });

    [baseRate, bonusRate, months].forEach((input) =>
      input.addEventListener("input", () => {
        render();
      })
    );

    [mode, payout, taxType].forEach((input) => input.addEventListener("change", render));

    principal.value = formatManwonInput(principal.value);
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["deposit-detail"] = initDepositDetailPage;
})();
