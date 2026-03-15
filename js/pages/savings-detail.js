(function () {
  const {
    clampNumber,
    formatManwonInput,
    formatWon,
    parseManwonInput,
    formatNumber,
    constants,
  } = window.LifeCalcUtils;

  const calculateSavings =
    (window.LifeCalcCalculators && window.LifeCalcCalculators.calculateSavings) ||
    function fallbackCalculateSavings(config) {
      const monthlyRate = config.annualRate / 12;
      const monthlyContribution = config.monthlyAmount + config.extraAmount;
      let balance = 0;
      let totalPrincipal = 0;
      for (let month = 1; month <= config.months; month += 1) {
        if (config.timing === "start") {
          balance += monthlyContribution;
          totalPrincipal += monthlyContribution;
          balance *= 1 + monthlyRate;
        } else {
          balance *= 1 + monthlyRate;
          balance += monthlyContribution;
          totalPrincipal += monthlyContribution;
        }
      }
      const grossInterest = Math.max(balance - totalPrincipal, 0);
      const tax = grossInterest * config.taxRate;
      return {
        totalPrincipal,
        grossInterest,
        tax,
        netInterest: grossInterest - tax,
        netMaturity: totalPrincipal + grossInterest - tax,
      };
    };

  function initSavingsDetailPage() {
    const monthlyAmount = document.getElementById("savingsDetailMonthlyAmount");
    const baseRate = document.getElementById("savingsDetailBaseRate");
    const bonusRate = document.getElementById("savingsDetailBonusRate");
    const months = document.getElementById("savingsDetailMonths");
    const extraAmount = document.getElementById("savingsDetailExtraAmount");
    const timing = document.getElementById("savingsDetailTiming");
    const taxType = document.getElementById("savingsDetailTaxType");
    const result = document.getElementById("savingsDetailResult");

    if (!monthlyAmount || !baseRate || !bonusRate || !months || !extraAmount || !timing || !taxType || !result) {
      return;
    }

    const render = () => {
      const monthlyAmountValue = parseManwonInput(monthlyAmount.value);
      const extraAmountValue = parseManwonInput(extraAmount.value);
      const annualRate =
        (clampNumber(baseRate.value, 0, constants.MAX_LOAN_RATE, 0) +
          clampNumber(bonusRate.value, 0, constants.MAX_LOAN_RATE, 0)) /
        100;
      const monthValue = clampNumber(months.value, 1, constants.MAX_LOAN_MONTHS, 1);
      const taxRate = taxType.value === "taxfree" ? 0 : 0.154;
      const summary = calculateSavings({
        monthlyAmount: monthlyAmountValue,
        annualRate,
        months: monthValue,
        taxRate,
        extraAmount: extraAmountValue,
        timing: timing.value,
      });

      const monthlyContribution = monthlyAmountValue + extraAmountValue;
      const middleBalance = monthlyContribution * Math.floor(monthValue / 2);

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary">
            <span>월 총 납입액</span>
            <strong>${formatWon(monthlyContribution)}</strong>
            <p>기본 납입액과 추가 납입액을 합한 매달 저축 금액입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>세후 만기 예상 금액</span>
            <strong>${formatWon(summary.netMaturity)}</strong>
            <p>세금까지 반영한 최종 예상 수령 금액입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>세후 총 이자</span>
            <strong>${formatWon(summary.netInterest)}</strong>
            <p>우대금리와 과세 방식을 반영한 실제 남는 이자입니다.</p>
          </article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>납입 흐름 요약</h4>
            <dl class="premium-breakdown-list">
              <div><dt>총 납입원금</dt><dd>${formatWon(summary.totalPrincipal)}</dd></div>
              <div><dt>기본 금리</dt><dd>${formatNumber(baseRate.value, 1)}%</dd></div>
              <div><dt>우대 금리</dt><dd>${formatNumber(bonusRate.value, 1)}%</dd></div>
              <div><dt>납입 시점</dt><dd>${timing.value === "start" ? "매달 초 납입" : "매달 말 납입"}</dd></div>
              <div><dt>기간 중간 누적 원금</dt><dd>${formatWon(middleBalance)}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>이자와 세금</h4>
            <dl class="premium-breakdown-list">
              <div><dt>세전 이자</dt><dd>${formatWon(summary.grossInterest)}</dd></div>
              <div><dt>이자 세금</dt><dd>${formatWon(summary.tax)}</dd></div>
              <div><dt>세후 이자</dt><dd>${formatWon(summary.netInterest)}</dd></div>
              <div><dt>과세 방식</dt><dd>${taxType.value === "taxfree" ? "비과세" : "일반과세"}</dd></div>
              <div><dt>납입 개월 수</dt><dd>${formatNumber(monthValue)}개월</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    [monthlyAmount, extraAmount].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = formatManwonInput(input.value);
        render();
      })
    );

    [baseRate, bonusRate, months].forEach((input) =>
      input.addEventListener("input", () => {
        render();
      })
    );

    [timing, taxType].forEach((input) => input.addEventListener("change", render));

    monthlyAmount.value = formatManwonInput(monthlyAmount.value);
    extraAmount.value = formatManwonInput(extraAmount.value);
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["savings-detail"] = initSavingsDetailPage;
})();
