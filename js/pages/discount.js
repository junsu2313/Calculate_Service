(function () {
  const { clampNumber, formatWon, setResultCard, constants } = window.LifeCalcUtils;

  function initDiscountPage() {
    const price = document.getElementById("discountPrice");
    const rate = document.getElementById("discountRate");
    const extra = document.getElementById("discountExtra");
    const result = document.getElementById("discountResult");

    const render = () => {
      const priceValue = clampNumber(price.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const rateValue = clampNumber(rate.value, 0, 100, 0);
      const extraValue = clampNumber(extra.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const discountAmount = priceValue * (rateValue / 100);
      const finalPrice = Math.max(priceValue - discountAmount - extraValue, 0);

      setResultCard(result, {
        label: "최종 결제 금액",
        value: formatWon(finalPrice),
        description: `할인 금액 ${formatWon(discountAmount)}과 추가 할인 ${formatWon(extraValue)}이 반영됐습니다.`,
        meta: [
          { label: "정가", value: formatWon(priceValue) },
          { label: "할인율", value: `${rateValue}%` },
          { label: "총 할인 금액", value: formatWon(discountAmount + extraValue) },
        ],
      });
    };

    [price, extra].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );

    rate.addEventListener("input", () => {
      rate.value = String(clampNumber(rate.value, 0, 100, 0));
      render();
    });

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.discount = initDiscountPage;
})();
