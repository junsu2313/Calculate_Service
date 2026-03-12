(function () {
  const { clampNumber, formatWon, setResultCard, constants } = window.LifeCalcUtils;

  function initSettlementPage() {
    const sales = document.getElementById("settlementSales");
    const feeRate = document.getElementById("settlementFeeRate");
    const shipping = document.getElementById("settlementShipping");
    const adCost = document.getElementById("settlementAdCost");
    const result = document.getElementById("settlementResult");

    const render = () => {
      const salesValue = clampNumber(sales.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const feeRateValue = clampNumber(feeRate.value, 0, 100, 0);
      const shippingValue = clampNumber(shipping.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const adCostValue = clampNumber(adCost.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const feeAmount = salesValue * (feeRateValue / 100);
      const netAmount = salesValue - feeAmount - shippingValue - adCostValue;

      setResultCard(result, {
        label: "예상 정산액",
        value: formatWon(netAmount),
        description: `수수료와 비용을 제외하면 ${formatWon(netAmount)}가 남습니다.`,
        meta: [
          { label: "수수료", value: formatWon(feeAmount) },
          { label: "배송비", value: formatWon(shippingValue) },
          { label: "광고비", value: formatWon(adCostValue) },
        ],
      });
    };

    [sales, shipping, adCost].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );

    feeRate.addEventListener("input", () => {
      feeRate.value = String(clampNumber(feeRate.value, 0, 100, 0));
      render();
    });

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.settlement = initSettlementPage;
})();
