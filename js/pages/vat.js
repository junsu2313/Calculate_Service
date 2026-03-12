(function () {
  const { clampNumber, formatWon, setResultCard, constants } = window.LifeCalcUtils;

  function initVatPage() {
    const supply = document.getElementById("vatSupply");
    const total = document.getElementById("vatTotal");
    const mode = document.getElementById("vatMode");
    const result = document.getElementById("vatResult");

    const render = () => {
      const supplyValue = clampNumber(supply.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const totalValue = clampNumber(total.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const vatMode = mode ? mode.value : "supply";

      if (vatMode === "total") {
        const supplyAmount = totalValue / 1.1;
        const vatAmount = totalValue - supplyAmount;

        setResultCard(result, {
          label: "공급가액",
          value: formatWon(supplyAmount),
          description: `부가세는 ${formatWon(vatAmount)}입니다.`,
          meta: [
            { label: "총 금액", value: formatWon(totalValue) },
            { label: "공급가액", value: formatWon(supplyAmount) },
            { label: "부가세", value: formatWon(vatAmount) },
          ],
        });
        return;
      }

      const vatAmount = supplyValue * 0.1;
      const totalAmount = supplyValue + vatAmount;

      setResultCard(result, {
        label: "부가세 포함 금액",
        value: formatWon(totalAmount),
        description: `부가세는 ${formatWon(vatAmount)}입니다.`,
        meta: [
          { label: "공급가액", value: formatWon(supplyValue) },
          { label: "부가세", value: formatWon(vatAmount) },
          { label: "합계", value: formatWon(totalAmount) },
        ],
      });
    };

    [supply, total].forEach((input) => {
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      });
    });

    if (mode) {
      mode.addEventListener("input", render);
    }

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.vat = initVatPage;
})();
