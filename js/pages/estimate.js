(function () {
  const { clampNumber, formatWon, setResultCard, constants } = window.LifeCalcUtils;

  function initEstimatePage() {
    const unitPrice = document.getElementById("estimateUnitPrice");
    const quantity = document.getElementById("estimateQuantity");
    const discountRate = document.getElementById("estimateDiscountRate");
    const vatIncluded = document.getElementById("estimateVatIncluded");
    const result = document.getElementById("estimateResult");

    const render = () => {
      const unitPriceValue = clampNumber(unitPrice.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const quantityValue = clampNumber(quantity.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const discountRateValue = clampNumber(discountRate.value, 0, 100, 0);
      const subtotal = unitPriceValue * quantityValue;
      const discountAmount = subtotal * (discountRateValue / 100);
      const supplyAmount = subtotal - discountAmount;
      const vatAmount = vatIncluded.checked ? supplyAmount * 0.1 : 0;
      const totalAmount = supplyAmount + vatAmount;

      setResultCard(result, {
        label: "최종 견적 금액",
        value: formatWon(totalAmount),
        description: `할인 반영 후 공급가액은 ${formatWon(supplyAmount)}입니다.`,
        meta: [
          { label: "수량", value: `${quantityValue.toLocaleString("ko-KR")}개` },
          { label: "할인 금액", value: formatWon(discountAmount) },
          { label: "부가세", value: formatWon(vatAmount) },
        ],
      });
    };

    [unitPrice, quantity].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );

    discountRate.addEventListener("input", () => {
      discountRate.value = String(clampNumber(discountRate.value, 0, 100, 0));
      render();
    });

    vatIncluded.addEventListener("input", render);
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.estimate = initEstimatePage;
})();
