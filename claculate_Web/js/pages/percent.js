(function () {
  const { clampNumber, formatDecimal, setResultCard, constants } = window.LifeCalcUtils;

  function initPercentPage() {
    const base = document.getElementById("percentBase");
    const part = document.getElementById("percentPart");
    const changeFrom = document.getElementById("percentChangeFrom");
    const changeTo = document.getElementById("percentChangeTo");
    const result = document.getElementById("percentResult");

    const render = () => {
      const baseValue = clampNumber(base.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const partValue = clampNumber(part.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const fromValue = clampNumber(changeFrom.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const toValue = clampNumber(changeTo.value, 0, constants.MAX_GENERIC_NUMBER, 0);

      const ratio = baseValue ? (partValue / baseValue) * 100 : 0;
      const diff = toValue - fromValue;
      const changeRate = fromValue ? (diff / fromValue) * 100 : 0;

      setResultCard(result, {
        label: "퍼센트 결과",
        value: `${formatDecimal(ratio)}%`,
        description: `${formatDecimal(partValue, 0)}는 ${formatDecimal(baseValue, 0)}의 ${formatDecimal(ratio)}%입니다.`,
        meta: [
          { label: "변화량", value: formatDecimal(diff) },
          { label: "증감률", value: `${formatDecimal(changeRate)}%` },
        ],
      });
    };

    [base, part, changeFrom, changeTo].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.percent = initPercentPage;
})();
