(function () {
  const { clampNumber, formatWon, formatDecimal, setResultCard, constants } = window.LifeCalcUtils;

  function initMarginPage() {
    const price = document.getElementById("marginPrice");
    const cost = document.getElementById("marginCost");
    const result = document.getElementById("marginResult");

    const render = () => {
      const priceValue = clampNumber(price.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const costValue = clampNumber(cost.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const profit = priceValue - costValue;
      const marginRate = priceValue ? (profit / priceValue) * 100 : 0;
      const markupRate = costValue ? (profit / costValue) * 100 : 0;

      setResultCard(result, {
        label: "마진율",
        value: `${formatDecimal(marginRate)}%`,
        description: `건당 마진은 ${formatWon(profit)}입니다.`,
        meta: [
          { label: "판매가", value: formatWon(priceValue) },
          { label: "원가", value: formatWon(costValue) },
          { label: "마크업", value: `${formatDecimal(markupRate)}%` },
        ],
      });
    };

    [price, cost].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.margin = initMarginPage;
})();
