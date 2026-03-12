(function () {
  const { clampNumber, formatWon, setResultCard, constants } = window.LifeCalcUtils;

  function initUsedPage() {
    const salePrice = document.getElementById("usedSalePrice");
    const shipping = document.getElementById("usedShipping");
    const feeRate = document.getElementById("usedFeeRate");
    const extraCost = document.getElementById("usedExtraCost");
    const result = document.getElementById("usedResult");

    const render = () => {
      const saleValue = clampNumber(salePrice.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const shippingValue = clampNumber(shipping.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const feeRateValue = clampNumber(feeRate.value, 0, 100, 0);
      const extraValue = clampNumber(extraCost.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const feeAmount = saleValue * (feeRateValue / 100);
      const totalCost = shippingValue + extraValue + feeAmount;
      const netProfit = Math.max(saleValue - totalCost, 0);

      setResultCard(result, {
        label: "예상 순수익",
        value: formatWon(netProfit),
        description: `판매가에서 수수료 ${formatWon(feeAmount)}와 비용 ${formatWon(shippingValue + extraValue)}을 뺐습니다.`,
        meta: [
          { label: "판매가", value: formatWon(saleValue) },
          { label: "수수료", value: formatWon(feeAmount) },
          { label: "총 비용", value: formatWon(totalCost) },
        ],
      });
    };

    [salePrice, shipping, extraCost].forEach((input) =>
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
  window.LifeCalcPages.used = initUsedPage;
})();
