(function () {
  const {
    clampNumber,
    formatManwonInput,
    parseManwonInput,
    formatWon,
    formatNumber,
  } = window.LifeCalcUtils;

  function initFreelanceDetailPage() {
    const contractAmount = document.getElementById("freelanceContractAmount");
    const vatMode = document.getElementById("freelanceVatMode");
    const withholding = document.getElementById("freelanceWithholding");
    const platformFee = document.getElementById("freelancePlatformFee");
    const directCost = document.getElementById("freelanceDirectCost");
    const fixedCost = document.getElementById("freelanceFixedCost");
    const taxReserve = document.getElementById("freelanceTaxReserve");
    const workDays = document.getElementById("freelanceWorkDaysDetail");
    const hoursPerDay = document.getElementById("freelanceHoursPerDayDetail");
    const result = document.getElementById("freelanceDetailResult");

    if (
      !contractAmount ||
      !vatMode ||
      !withholding ||
      !platformFee ||
      !directCost ||
      !fixedCost ||
      !taxReserve ||
      !workDays ||
      !hoursPerDay ||
      !result
    ) {
      return;
    }

    const render = () => {
      const contractValue = parseManwonInput(contractAmount.value);
      const vatIncluded = vatMode.value === "inclusive";
      const withholdingEnabled = withholding.value === "yes";
      const platformFeeRate = clampNumber(platformFee.value, 0, 100, 0);
      const directCostValue = parseManwonInput(directCost.value);
      const fixedCostValue = parseManwonInput(fixedCost.value);
      const taxReserveRate = clampNumber(taxReserve.value, 0, 100, 0);
      const workDaysValue = clampNumber(workDays.value, 1, 31, 1);
      const hoursValue = clampNumber(hoursPerDay.value, 1, 24, 1);

      if (!contractValue) {
        result.innerHTML = "";
        return;
      }

      const supplyAmount = vatIncluded ? contractValue / 1.1 : contractValue;
      const vatAmount = vatIncluded ? contractValue - supplyAmount : contractValue * 0.1;
      const withholdingAmount = withholdingEnabled ? supplyAmount * 0.033 : 0;
      const platformFeeAmount = supplyAmount * (platformFeeRate / 100);
      const taxReserveAmount = supplyAmount * (taxReserveRate / 100);
      const depositedAmount = supplyAmount + (vatIncluded ? 0 : vatAmount) - withholdingAmount - platformFeeAmount;
      const usableAmount = depositedAmount - directCostValue - fixedCostValue - taxReserveAmount - (vatIncluded ? vatAmount : 0);
      const dayRate = workDaysValue > 0 ? usableAmount / workDaysValue : 0;
      const hourRate = hoursValue > 0 ? dayRate / hoursValue : 0;

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary">
            <span>실제 입금 예상액</span>
            <strong>${formatWon(depositedAmount)}</strong>
            <p>원천징수와 플랫폼 수수료까지 반영해 통장에 들어오는 금액 기준입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>실사용 가능 금액</span>
            <strong>${formatWon(usableAmount)}</strong>
            <p>세금 적립금과 외주비, 고정비, 보관해야 할 부가세까지 제외한 기준입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>권장 시간당 단가</span>
            <strong>${formatWon(hourRate)}</strong>
            <p>현재 조건에서 실제 남는 금액을 기준으로 다시 계산한 시간당 단가입니다.</p>
          </article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>금액 흐름</h4>
            <dl class="premium-breakdown-list">
              <div><dt>월 계약 금액</dt><dd>${formatWon(contractValue)}</dd></div>
              <div><dt>공급가</dt><dd>${formatWon(supplyAmount)}</dd></div>
              <div><dt>부가세</dt><dd>${formatWon(vatAmount)}</dd></div>
              <div><dt>3.3% 원천징수</dt><dd>${formatWon(withholdingAmount)}</dd></div>
              <div><dt>플랫폼 수수료</dt><dd>${formatWon(platformFeeAmount)}</dd></div>
              <div><dt>세금 적립금</dt><dd>${formatWon(taxReserveAmount)}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>실제 남는 금액</h4>
            <dl class="premium-breakdown-list">
              <div><dt>외주/재료비</dt><dd>${formatWon(directCostValue)}</dd></div>
              <div><dt>월 고정비</dt><dd>${formatWon(fixedCostValue)}</dd></div>
              <div><dt>월 작업일수</dt><dd>${formatNumber(workDaysValue)}일</dd></div>
              <div><dt>하루 작업시간</dt><dd>${formatNumber(hoursValue)}시간</dd></div>
              <div><dt>권장 일당</dt><dd>${formatWon(dayRate)}</dd></div>
              <div><dt>권장 시간당 단가</dt><dd>${formatWon(hourRate)}</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    [contractAmount, directCost, fixedCost].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = formatManwonInput(input.value);
        render();
      })
    );

    [vatMode, withholding].forEach((input) => input.addEventListener("change", render));

    [platformFee, taxReserve, workDays, hoursPerDay].forEach((input) =>
      input.addEventListener("input", () => {
        render();
      })
    );

    contractAmount.value = formatManwonInput(contractAmount.value);
    directCost.value = formatManwonInput(directCost.value);
    fixedCost.value = formatManwonInput(fixedCost.value);
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["freelance-detail"] = initFreelanceDetailPage;
})();
