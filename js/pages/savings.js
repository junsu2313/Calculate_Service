(function () {
  const {
    clampNumber,
    formatManwonInput,
    formatWon,
    parseManwonInput,
    setResultCard,
    constants,
  } = window.LifeCalcUtils;

  function initSavingsPage() {
    const monthlyAmount = document.getElementById("savingsMonthlyAmount");
    const rate = document.getElementById("savingsRate");
    const months = document.getElementById("savingsMonths");
    const taxType = document.getElementById("savingsTaxType");
    const result = document.getElementById("savingsResult");

    if (!monthlyAmount || !rate || !months || !taxType || !result) {
      return;
    }

    const render = () => {
      const monthlyAmountValue = parseManwonInput(monthlyAmount.value);
      const annualRate = clampNumber(rate.value, 0, constants.MAX_LOAN_RATE, 0) / 100;
      const monthValue = clampNumber(months.value, 1, constants.MAX_LOAN_MONTHS, 1);
      const taxRate = taxType.value === "taxfree" ? 0 : 0.154;
      const summary = calculateSavings({
        monthlyAmount: monthlyAmountValue,
        annualRate,
        months: monthValue,
        taxRate,
        extraAmount: 0,
        timing: "end",
      });

      setResultCard(result, {
        label: "세후 만기 예상 금액",
        value: formatWon(summary.netMaturity),
        description: "매달 말 납입 기준의 단순 계산 결과입니다.",
        meta: [
          { label: "총 납입원금", value: formatWon(summary.totalPrincipal) },
          { label: "세전 이자", value: formatWon(summary.grossInterest) },
          { label: "세후 이자", value: formatWon(summary.netInterest) },
        ],
      });
    };

    monthlyAmount.addEventListener("input", () => {
      monthlyAmount.value = formatManwonInput(monthlyAmount.value);
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

    monthlyAmount.value = formatManwonInput(monthlyAmount.value);
    render();
  }

  function calculateSavings(config) {
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
    const netInterest = grossInterest - tax;
    const netMaturity = totalPrincipal + netInterest;

    return {
      totalPrincipal,
      grossInterest,
      netInterest,
      netMaturity,
      tax,
    };
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.savings = initSavingsPage;
  window.LifeCalcCalculators = window.LifeCalcCalculators || {};
  window.LifeCalcCalculators.calculateSavings = calculateSavings;
})();
