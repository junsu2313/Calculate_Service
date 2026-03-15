(function () {
  const {
    clampNumber,
    formatManwonInput,
    formatWon,
    parseManwonInput,
    setResultCard,
    constants,
  } = window.LifeCalcUtils;

  function initDepositPage() {
    const principal = document.getElementById("depositPrincipal");
    const rate = document.getElementById("depositRate");
    const months = document.getElementById("depositMonths");
    const taxType = document.getElementById("depositTaxType");
    const result = document.getElementById("depositResult");

    if (!principal || !rate || !months || !taxType || !result) {
      return;
    }

    const render = () => {
      const principalValue = parseManwonInput(principal.value);
      const annualRate = clampNumber(rate.value, 0, constants.MAX_LOAN_RATE, 0) / 100;
      const monthValue = clampNumber(months.value, 1, constants.MAX_LOAN_MONTHS, 1);
      const taxRate = taxType.value === "taxfree" ? 0 : 0.154;
      const summary = calculateDeposit({
        principal: principalValue,
        annualRate,
        months: monthValue,
        taxRate,
        mode: "simple",
        payout: "maturity",
      });

      setResultCard(result, {
        label: "세후 만기 예상 금액",
        value: formatWon(summary.netMaturity),
        description: "단리, 만기지급 기준의 단순 계산 결과입니다.",
        meta: [
          { label: "예치 원금", value: formatWon(summary.principal) },
          { label: "세전 이자", value: formatWon(summary.grossInterest) },
          { label: "세후 이자", value: formatWon(summary.netInterest) },
        ],
      });
    };

    principal.addEventListener("input", () => {
      principal.value = formatManwonInput(principal.value);
      render();
    });

    rate.addEventListener("input", () => {
      rate.value = String(clampNumber(rate.value, 0, constants.MAX_LOAN_RATE, 0));
      render();
    });

    months.addEventListener("input", () => {
      months.value = String(clampNumber(months.value, 1, constants.MAX_LOAN_MONTHS, 1));
      render();
    });

    taxType.addEventListener("change", render);

    principal.value = formatManwonInput(principal.value);
    render();
  }

  function calculateDeposit(config) {
    let grossInterest = 0;
    if (config.mode === "compound") {
      const monthlyRate = config.annualRate / 12;
      const grossBalance = config.principal * (1 + monthlyRate) ** config.months;
      grossInterest = grossBalance - config.principal;
    } else {
      grossInterest = config.principal * config.annualRate * (config.months / 12);
    }

    const tax = grossInterest * config.taxRate;
    const netInterest = grossInterest - tax;
    const netMaturity = config.payout === "monthly" ? config.principal : config.principal + netInterest;

    return {
      principal: config.principal,
      grossInterest,
      tax,
      netInterest,
      netMaturity,
    };
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.deposit = initDepositPage;
  window.LifeCalcCalculators = window.LifeCalcCalculators || {};
  window.LifeCalcCalculators.calculateDeposit = calculateDeposit;
})();
