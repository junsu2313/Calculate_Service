(function () {
  const { clampNumber, formatWon, setResultCard, constants } = window.LifeCalcUtils;

  function initFixedCostPage() {
    const rent = document.getElementById("fixedcostRent");
    const payroll = document.getElementById("fixedcostPayroll");
    const utilities = document.getElementById("fixedcostUtilities");
    const software = document.getElementById("fixedcostSoftware");
    const other = document.getElementById("fixedcostOther");
    const result = document.getElementById("fixedcostResult");
    const inputs = [rent, payroll, utilities, software, other];

    const render = () => {
      const values = inputs.map((input) => clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
      const total = values.reduce((sum, value) => sum + value, 0);

      setResultCard(result, {
        label: "월 고정비 합계",
        value: formatWon(total),
        description: "매달 반복되는 운영비를 한 번에 확인할 수 있습니다.",
        meta: [
          { label: "임대료", value: formatWon(values[0]) },
          { label: "인건비", value: formatWon(values[1]) },
          { label: "기타 비용", value: formatWon(values[4]) },
        ],
      });
    };

    inputs.forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.fixedcost = initFixedCostPage;
})();
