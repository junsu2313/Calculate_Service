(function () {
  const {
    clampNumber,
    formatManwonInput,
    formatWon,
    parseManwonInput,
    setResultCard,
    constants,
  } = window.LifeCalcUtils;

  function initSalaryPage() {
    const annual = document.getElementById("salaryAnnual");
    const taxFree = document.getElementById("salaryFree");
    const dependents = document.getElementById("salaryDependents");
    const children = document.getElementById("salaryChildren");
    const result = document.getElementById("salaryResult");

    const render = () => {
      const annualValue = parseManwonInput(annual.value);
      const taxFreeValue = parseManwonInput(taxFree.value);
      const dependentValue = clampNumber(dependents.value, 1, constants.MAX_DEPENDENTS, 1);
      const childValue = clampNumber(children.value, 0, constants.MAX_CHILDREN, 0);
      const monthlyGross = annualValue / 12;
      const taxableMonthly = Math.max(monthlyGross - taxFreeValue, 0);
      const pension = taxableMonthly * 0.045;
      const health = taxableMonthly * 0.03545;
      const care = health * 0.1295;
      const employment = taxableMonthly * 0.009;
      const deductionFactor = 1 - Math.min((dependentValue - 1) * 0.015 + childValue * 0.01, 0.08);
      const incomeTax = taxableMonthly * 0.028 * deductionFactor;
      const localTax = incomeTax * 0.1;
      const totalDeduction = pension + health + care + employment + incomeTax + localTax;
      const net = monthlyGross - totalDeduction;

      setResultCard(result, {
        label: "예상 월 실수령액",
        value: formatWon(net),
        description: "간이 추정치이며 실제 급여명세서와 차이가 있을 수 있습니다.",
        meta: [
          { label: "세전 월급", value: formatWon(monthlyGross) },
          { label: "공제 합계", value: formatWon(totalDeduction) },
          { label: "예상 연 실수령액", value: formatWon(net * 12) },
        ],
      });
    };

    [annual, taxFree].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = formatManwonInput(input.value);
        render();
      })
    );

    dependents.addEventListener("input", () => {
      dependents.value = String(clampNumber(dependents.value, 1, constants.MAX_DEPENDENTS, 1));
      render();
    });

    children.addEventListener("input", () => {
      children.value = String(clampNumber(children.value, 0, constants.MAX_CHILDREN, 0));
      render();
    });

    annual.value = formatManwonInput(annual.value);
    taxFree.value = formatManwonInput(taxFree.value);
    dependents.value = String(clampNumber(dependents.value, 1, constants.MAX_DEPENDENTS, 1));
    children.value = String(clampNumber(children.value, 0, constants.MAX_CHILDREN, 0));
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.salary = initSalaryPage;
})();
