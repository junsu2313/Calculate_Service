(function () {
  const { clampNumber, formatWon, formatNumber, constants } = window.LifeCalcUtils;

  function initVatDetailPage() {
    const mode = document.getElementById("vatDetailMode");
    const amount = document.getElementById("vatDetailAmount");
    const quantity = document.getElementById("vatDetailQuantity");
    const rate = document.getElementById("vatDetailRate");
    const extra = document.getElementById("vatDetailExtra");
    const result = document.getElementById("vatDetailResult");

    if (!mode || !amount || !quantity || !rate || !extra || !result) {
      return;
    }

    const render = () => {
      const amountValue = clampNumber(amount.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const quantityValue = clampNumber(quantity.value, 1, constants.MAX_GENERIC_NUMBER, 1);
      const rateValue = clampNumber(rate.value, 0, 100, 0);
      const extraValue = clampNumber(extra.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const lineAmount = amountValue * quantityValue;
      const taxRate = rateValue / 100;
      let supplyAmount = 0;
      let vatAmount = 0;

      if (mode.value === "total") {
        supplyAmount = lineAmount / (1 + taxRate);
        vatAmount = lineAmount - supplyAmount;
      } else {
        supplyAmount = lineAmount;
        vatAmount = supplyAmount * taxRate;
      }

      const totalAmount = supplyAmount + vatAmount + extraValue;

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary">
            <span>공급가 합계</span>
            <strong>${formatWon(supplyAmount)}</strong>
            <p>수량까지 반영한 공급가 기준 금액입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>부가세 합계</span>
            <strong>${formatWon(vatAmount)}</strong>
            <p>입력한 세율 기준으로 계산한 부가세 금액입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>최종 청구 금액</span>
            <strong>${formatWon(totalAmount)}</strong>
            <p>추가 비용까지 포함한 최종 금액입니다.</p>
          </article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>입력 기준</h4>
            <dl class="premium-breakdown-list">
              <div><dt>계산 기준</dt><dd>${mode.value === "total" ? "총 금액 기준" : "공급가액 기준"}</dd></div>
              <div><dt>수량</dt><dd>${formatNumber(quantityValue)}개</dd></div>
              <div><dt>세율</dt><dd>${formatNumber(rateValue, 1)}%</dd></div>
              <div><dt>추가 비용</dt><dd>${formatWon(extraValue)}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>금액 흐름</h4>
            <dl class="premium-breakdown-list">
              <div><dt>라인 금액</dt><dd>${formatWon(lineAmount)}</dd></div>
              <div><dt>공급가</dt><dd>${formatWon(supplyAmount)}</dd></div>
              <div><dt>부가세</dt><dd>${formatWon(vatAmount)}</dd></div>
              <div><dt>최종 합계</dt><dd>${formatWon(totalAmount)}</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    [mode, amount, quantity, rate, extra].forEach((input) =>
      input.addEventListener("input", () => {
        if (input.type === "number") {
          const max = input.id === "vatDetailRate" ? 100 : constants.MAX_GENERIC_NUMBER;
          const fallback = input.id === "vatDetailQuantity" ? 1 : 0;
          input.value = String(clampNumber(input.value, 0, max, fallback));
        }
        render();
      })
    );

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["vat-detail"] = initVatDetailPage;
})();
