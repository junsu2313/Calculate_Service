(function () {
  const {
    clampNumber,
    formatManwonInput,
    formatWon,
    parseManwonInput,
    formatNumber,
    constants,
  } = window.LifeCalcUtils;

  function initSalarySlipPage() {
    const annual = document.getElementById("salaryAnnual");
    const taxFree = document.getElementById("salaryFree");
    const dependents = document.getElementById("salaryDependents");
    const children = document.getElementById("salaryChildren");
    const payMonths = document.getElementById("salaryPayMonths");
    const annualBonus = document.getElementById("salaryBonusAnnual");
    const payslipResult = document.getElementById("salaryPayslipResult");

    if (!annual || !taxFree || !dependents || !children || !payMonths || !annualBonus || !payslipResult) {
      return;
    }

    const render = () => {
      const annualValue = parseManwonInput(annual.value);
      const taxFreeValue = parseManwonInput(taxFree.value);
      const dependentValue = clampNumber(dependents.value, 1, constants.MAX_DEPENDENTS, 1);
      const childValue = clampNumber(children.value, 0, constants.MAX_CHILDREN, 0);
      const payMonthValue = clampNumber(payMonths.value, 12, 16, 12);
      const annualBonusValue = parseManwonInput(annualBonus.value);
      const monthlyRealisticGross = annualValue / payMonthValue;
      const realisticTaxable = Math.max(monthlyRealisticGross - taxFreeValue, 0);
      const realisticMonthlyDeductions = getDeductionBreakdown(
        realisticTaxable,
        dependentValue,
        childValue
      );
      const realisticMonthlyNet = monthlyRealisticGross - realisticMonthlyDeductions.total;
      const bonusTaxable = Math.max(annualBonusValue, 0);
      const bonusDeductions = getDeductionBreakdown(
        bonusTaxable,
        dependentValue,
        childValue,
        1 + Math.max((payMonthValue - 12) * 0.08, 0)
      );
      const bonusMonthNet = realisticMonthlyNet + annualBonusValue - bonusDeductions.total;
      const annualPremiumNet = realisticMonthlyNet * payMonthValue + (annualBonusValue - bonusDeductions.total);

      payslipResult.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary">
            <span>일반 지급월</span>
            <strong>${formatWon(realisticMonthlyNet)}</strong>
            <p>연봉을 ${formatNumber(payMonthValue)}개월로 나눠 지급한다고 가정한 월 실수령액입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>상여 포함월</span>
            <strong>${formatWon(bonusMonthNet)}</strong>
            <p>연간 상여 ${formatWon(annualBonusValue)}를 1회 지급한다고 가정한 달의 예상 수령액입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>실전형 연 실수령액</span>
            <strong>${formatWon(annualPremiumNet)}</strong>
            <p>기본 지급월과 상여 포함월을 합친 연간 추정치입니다.</p>
          </article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>일반 지급월 공제</h4>
            <dl class="premium-breakdown-list">
              <div><dt>국민연금</dt><dd>${formatWon(realisticMonthlyDeductions.pension)}</dd></div>
              <div><dt>건강보험</dt><dd>${formatWon(realisticMonthlyDeductions.health)}</dd></div>
              <div><dt>장기요양</dt><dd>${formatWon(realisticMonthlyDeductions.care)}</dd></div>
              <div><dt>고용보험</dt><dd>${formatWon(realisticMonthlyDeductions.employment)}</dd></div>
              <div><dt>소득세</dt><dd>${formatWon(realisticMonthlyDeductions.incomeTax)}</dd></div>
              <div><dt>지방소득세</dt><dd>${formatWon(realisticMonthlyDeductions.localTax)}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>실전형 가정</h4>
            <dl class="premium-breakdown-list">
              <div><dt>지급 개월 수</dt><dd>${formatNumber(payMonthValue)}개월</dd></div>
              <div><dt>연간 상여</dt><dd>${formatWon(annualBonusValue)}</dd></div>
              <div><dt>월 비과세</dt><dd>${formatWon(taxFreeValue)}</dd></div>
              <div><dt>부양가족</dt><dd>${formatNumber(dependentValue)}명</dd></div>
              <div><dt>자녀 수</dt><dd>${formatNumber(childValue)}명</dd></div>
              <div><dt>월 공제 합계</dt><dd>${formatWon(realisticMonthlyDeductions.total)}</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    [annual, taxFree, annualBonus].forEach((input) =>
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

    payMonths.addEventListener("change", () => {
      payMonths.value = String(clampNumber(payMonths.value, 12, 16, 12));
      render();
    });

    annual.value = formatManwonInput(annual.value);
    taxFree.value = formatManwonInput(taxFree.value);
    annualBonus.value = formatManwonInput(annualBonus.value);
    dependents.value = String(clampNumber(dependents.value, 1, constants.MAX_DEPENDENTS, 1));
    children.value = String(clampNumber(children.value, 0, constants.MAX_CHILDREN, 0));
    payMonths.value = String(clampNumber(payMonths.value, 12, 16, 12));
    render();
  }

  function getDeductionBreakdown(taxableMonthly, dependentValue, childValue, taxWeight = 1) {
    const pension = taxableMonthly * 0.045;
    const health = taxableMonthly * 0.03545;
    const care = health * 0.1295;
    const employment = taxableMonthly * 0.009;
    const deductionFactor = 1 - Math.min((dependentValue - 1) * 0.015 + childValue * 0.01, 0.08);
    const incomeTax = taxableMonthly * 0.028 * deductionFactor * taxWeight;
    const localTax = incomeTax * 0.1;
    const total = pension + health + care + employment + incomeTax + localTax;

    return {
      pension,
      health,
      care,
      employment,
      incomeTax,
      localTax,
      total,
    };
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["salary-slip"] = initSalarySlipPage;
})();
