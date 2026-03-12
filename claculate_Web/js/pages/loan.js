(function () {
  const {
    clampNumber,
    formatManwonInput,
    formatWon,
    parseManwonInput,
    setResultCard,
    constants,
  } = window.LifeCalcUtils;

  function initLoanPage() {
    const principal = document.getElementById("loanPrincipal");
    const rate = document.getElementById("loanRate");
    const months = document.getElementById("loanMonths");
    const type = document.getElementById("loanType");
    const result = document.getElementById("loanResult");

    const render = () => {
      const principalValue = parseManwonInput(principal.value);
      const annualRate = clampNumber(rate.value, 0, constants.MAX_LOAN_RATE, 0) / 100;
      const monthValue = clampNumber(months.value, 1, constants.MAX_LOAN_MONTHS, 1);
      const repaymentType = type ? type.value : "amortized";

      if (!principalValue || !monthValue) {
        setResultCard(result, {
          label: "예상 월 납입액",
          value: "입력 필요",
          description: "원금과 기간을 입력하면 결과가 표시됩니다.",
        });
        return;
      }

      const monthlyRate = annualRate / 12;

      if (repaymentType === "equalPrincipal") {
        const principalPerMonth = principalValue / monthValue;
        const firstMonthPayment = principalPerMonth + principalValue * monthlyRate;
        const lastMonthPayment = principalPerMonth + principalPerMonth * monthlyRate;
        const totalInterest =
          monthlyRate === 0 ? 0 : (principalValue * monthlyRate * (monthValue + 1)) / 2;
        const totalPaid = principalValue + totalInterest;

        setResultCard(result, {
          label: "첫 달 납입액",
          value: formatWon(firstMonthPayment),
          description: `마지막 달 납입액은 ${formatWon(lastMonthPayment)}입니다.`,
          meta: [
            { label: "총 상환액", value: formatWon(totalPaid) },
            { label: "총 이자", value: formatWon(totalInterest) },
            { label: "상환 기간", value: `${monthValue}개월` },
          ],
        });
        return;
      }

      if (repaymentType === "bullet") {
        const monthlyInterest = principalValue * monthlyRate;
        const totalInterest = monthlyInterest * monthValue;
        const maturityPayment = principalValue + monthlyInterest;

        setResultCard(result, {
          label: "매달 이자 납입액",
          value: formatWon(monthlyInterest),
          description: `만기 상환액은 ${formatWon(maturityPayment)}입니다.`,
          meta: [
            { label: "만기 상환액", value: formatWon(maturityPayment) },
            { label: "총 이자", value: formatWon(totalInterest) },
            { label: "상환 기간", value: `${monthValue}개월` },
          ],
        });
        return;
      }

      const monthlyPayment =
        monthlyRate === 0
          ? principalValue / monthValue
          : (principalValue * monthlyRate * (1 + monthlyRate) ** monthValue) /
            ((1 + monthlyRate) ** monthValue - 1);
      const totalPaid = monthlyPayment * monthValue;
      const totalInterest = totalPaid - principalValue;

      setResultCard(result, {
        label: "예상 월 납입액",
        value: formatWon(monthlyPayment),
        description: "원리금균등 상환 기준의 단순 계산 결과입니다.",
        meta: [
          { label: "총 상환액", value: formatWon(totalPaid) },
          { label: "총 이자", value: formatWon(totalInterest) },
          { label: "상환 기간", value: `${monthValue}개월` },
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

    if (type) {
      type.addEventListener("input", render);
    }

    principal.value = formatManwonInput(principal.value);
    rate.value = String(clampNumber(rate.value, 0, constants.MAX_LOAN_RATE, 0));
    months.value = String(clampNumber(months.value, 1, constants.MAX_LOAN_MONTHS, 1));
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.loan = initLoanPage;
})();
