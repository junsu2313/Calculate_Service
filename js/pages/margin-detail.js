(function () {
  const { clampNumber, formatWon, formatDecimal, constants } = window.LifeCalcUtils;

  function initMarginDetailPage() {
    const price = document.getElementById("marginDetailPrice");
    const cost = document.getElementById("marginDetailCost");
    const platform = document.getElementById("marginDetailPlatformFee");
    const payment = document.getElementById("marginDetailPaymentFee");
    const shipping = document.getElementById("marginDetailShipping");
    const ad = document.getElementById("marginDetailAdCost");
    const result = document.getElementById("marginDetailResult");

    if (!price || !cost || !platform || !payment || !shipping || !ad || !result) {
      return;
    }

    const render = () => {
      const priceValue = clampNumber(price.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const costValue = clampNumber(cost.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const platformValue = clampNumber(platform.value, 0, 100, 0);
      const paymentValue = clampNumber(payment.value, 0, 100, 0);
      const shippingValue = clampNumber(shipping.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const adValue = clampNumber(ad.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const platformFee = priceValue * (platformValue / 100);
      const paymentFee = priceValue * (paymentValue / 100);
      const profit = priceValue - costValue - platformFee - paymentFee - shippingValue - adValue;
      const netMarginRate = priceValue ? (profit / priceValue) * 100 : 0;

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary"><span>실제 건당 이익</span><strong>${formatWon(profit)}</strong><p>수수료와 비용까지 뺀 뒤 남는 실제 금액입니다.</p></article>
          <article class="premium-payslip-summary"><span>순마진율</span><strong>${formatDecimal(netMarginRate)}%</strong><p>판매가 대비 실제 순이익 비율입니다.</p></article>
          <article class="premium-payslip-summary"><span>총 차감 비용</span><strong>${formatWon(platformFee + paymentFee + shippingValue + adValue)}</strong><p>원가 외에 추가로 빠지는 비용 합계입니다.</p></article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>수수료와 비용</h4>
            <dl class="premium-breakdown-list">
              <div><dt>플랫폼 수수료</dt><dd>${formatWon(platformFee)}</dd></div>
              <div><dt>결제 수수료</dt><dd>${formatWon(paymentFee)}</dd></div>
              <div><dt>배송비</dt><dd>${formatWon(shippingValue)}</dd></div>
              <div><dt>광고비</dt><dd>${formatWon(adValue)}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>금액 흐름</h4>
            <dl class="premium-breakdown-list">
              <div><dt>판매가</dt><dd>${formatWon(priceValue)}</dd></div>
              <div><dt>원가</dt><dd>${formatWon(costValue)}</dd></div>
              <div><dt>실제 건당 이익</dt><dd>${formatWon(profit)}</dd></div>
              <div><dt>순마진율</dt><dd>${formatDecimal(netMarginRate)}%</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    [price, cost, shipping, ad].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );
    [platform, payment].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, 100, 0));
        render();
      })
    );

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["margin-detail"] = initMarginDetailPage;
})();
