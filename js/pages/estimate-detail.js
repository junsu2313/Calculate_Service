(function () {
  const { clampNumber, formatWon, formatNumber, constants } = window.LifeCalcUtils;

  function initEstimateDetailPage() {
    const unit = document.getElementById("estimateDetailUnitPrice");
    const quantity = document.getElementById("estimateDetailQuantity");
    const rate = document.getElementById("estimateDetailDiscountRate");
    const extra = document.getElementById("estimateDetailExtraDiscount");
    const shipping = document.getElementById("estimateDetailShipping");
    const vat = document.getElementById("estimateDetailVatRate");
    const deposit = document.getElementById("estimateDetailDepositRate");
    const result = document.getElementById("estimateDetailResult");

    if (!unit || !quantity || !rate || !extra || !shipping || !vat || !deposit || !result) {
      return;
    }

    const render = () => {
      const unitValue = clampNumber(unit.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const quantityValue = clampNumber(quantity.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const rateValue = clampNumber(rate.value, 0, 100, 0);
      const extraValue = clampNumber(extra.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const shippingValue = clampNumber(shipping.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const vatValue = clampNumber(vat.value, 0, 100, 0);
      const depositValue = clampNumber(deposit.value, 0, 100, 0);
      const subtotal = unitValue * quantityValue;
      const rateDiscount = subtotal * (rateValue / 100);
      const supplyAmount = Math.max(subtotal - rateDiscount - extraValue + shippingValue, 0);
      const vatAmount = supplyAmount * (vatValue / 100);
      const totalAmount = supplyAmount + vatAmount;
      const depositAmount = totalAmount * (depositValue / 100);
      const balanceAmount = totalAmount - depositAmount;

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary"><span>최종 견적 금액</span><strong>${formatWon(totalAmount)}</strong><p>할인과 배송비, 부가세를 모두 반영한 최종 견적입니다.</p></article>
          <article class="premium-payslip-summary"><span>착수금</span><strong>${formatWon(depositAmount)}</strong><p>입력한 착수금 비율 기준 선입금 금액입니다.</p></article>
          <article class="premium-payslip-summary"><span>잔금</span><strong>${formatWon(balanceAmount)}</strong><p>착수금을 제외하고 나중에 받는 나머지 금액입니다.</p></article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>할인과 공급가</h4>
            <dl class="premium-breakdown-list">
              <div><dt>수량</dt><dd>${formatNumber(quantityValue)}개</dd></div>
              <div><dt>비율 할인</dt><dd>${formatWon(rateDiscount)}</dd></div>
              <div><dt>추가 할인</dt><dd>${formatWon(extraValue)}</dd></div>
              <div><dt>배송비</dt><dd>${formatWon(shippingValue)}</dd></div>
              <div><dt>공급가</dt><dd>${formatWon(supplyAmount)}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>부가세와 지급</h4>
            <dl class="premium-breakdown-list">
              <div><dt>부가세</dt><dd>${formatWon(vatAmount)}</dd></div>
              <div><dt>최종 견적</dt><dd>${formatWon(totalAmount)}</dd></div>
              <div><dt>착수금 비율</dt><dd>${formatNumber(depositValue, 1)}%</dd></div>
              <div><dt>착수금</dt><dd>${formatWon(depositAmount)}</dd></div>
              <div><dt>잔금</dt><dd>${formatWon(balanceAmount)}</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    [unit, quantity, extra, shipping].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );
    [rate, vat, deposit].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, 100, 0));
        render();
      })
    );

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["estimate-detail"] = initEstimateDetailPage;
})();
