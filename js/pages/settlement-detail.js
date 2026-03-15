(function () {
  const { clampNumber, formatWon, constants } = window.LifeCalcUtils;

  function initSettlementDetailPage() {
    const sales = document.getElementById("settlementDetailSales");
    const fee = document.getElementById("settlementDetailFeeRate");
    const shipping = document.getElementById("settlementDetailShipping");
    const ad = document.getElementById("settlementDetailAdCost");
    const refund = document.getElementById("settlementDetailRefund");
    const coupon = document.getElementById("settlementDetailCoupon");
    const vatReserve = document.getElementById("settlementDetailVatReserveRate");
    const result = document.getElementById("settlementDetailResult");

    if (!sales || !fee || !shipping || !ad || !refund || !coupon || !vatReserve || !result) {
      return;
    }

    const render = () => {
      const salesValue = clampNumber(sales.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const feeRate = clampNumber(fee.value, 0, 100, 0);
      const shippingValue = clampNumber(shipping.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const adValue = clampNumber(ad.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const refundValue = clampNumber(refund.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const couponValue = clampNumber(coupon.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const vatReserveRate = clampNumber(vatReserve.value, 0, 100, 0);
      const adjustedSales = Math.max(salesValue - refundValue - couponValue, 0);
      const feeAmount = adjustedSales * (feeRate / 100);
      const vatReserveAmount = adjustedSales * (vatReserveRate / 100);
      const netAmount = adjustedSales - feeAmount - shippingValue - adValue - vatReserveAmount;

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary"><span>조정 후 매출</span><strong>${formatWon(adjustedSales)}</strong><p>환불과 쿠폰 부담금을 먼저 반영한 매출 기준입니다.</p></article>
          <article class="premium-payslip-summary"><span>예상 정산액</span><strong>${formatWon(netAmount)}</strong><p>수수료와 비용, 부가세 보관액까지 제외한 뒤 남는 금액입니다.</p></article>
          <article class="premium-payslip-summary"><span>보관할 부가세</span><strong>${formatWon(vatReserveAmount)}</strong><p>정산금 전체를 바로 쓰지 않도록 따로 빼두는 기준 금액입니다.</p></article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>차감 항목</h4>
            <dl class="premium-breakdown-list">
              <div><dt>수수료</dt><dd>${formatWon(feeAmount)}</dd></div>
              <div><dt>배송비</dt><dd>${formatWon(shippingValue)}</dd></div>
              <div><dt>광고비</dt><dd>${formatWon(adValue)}</dd></div>
              <div><dt>환불 금액</dt><dd>${formatWon(refundValue)}</dd></div>
              <div><dt>쿠폰 부담금</dt><dd>${formatWon(couponValue)}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>남는 금액</h4>
            <dl class="premium-breakdown-list">
              <div><dt>총 매출</dt><dd>${formatWon(salesValue)}</dd></div>
              <div><dt>조정 후 매출</dt><dd>${formatWon(adjustedSales)}</dd></div>
              <div><dt>부가세 보관액</dt><dd>${formatWon(vatReserveAmount)}</dd></div>
              <div><dt>예상 정산액</dt><dd>${formatWon(netAmount)}</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    [sales, shipping, ad, refund, coupon].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );
    [fee, vatReserve].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, 100, 0));
        render();
      })
    );

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["settlement-detail"] = initSettlementDetailPage;
})();
