(function () {
  const { clampNumber, formatWon, formatNumber, setResultCard, constants } = window.LifeCalcUtils;

  function initBreakevenPage() {
    const fixedCost = document.getElementById("breakevenFixedCost");
    const unitPrice = document.getElementById("breakevenUnitPrice");
    const variableCost = document.getElementById("breakevenVariableCost");
    const result = document.getElementById("breakevenResult");

    const render = () => {
      const fixedCostValue = clampNumber(fixedCost.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const unitPriceValue = clampNumber(unitPrice.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const variableCostValue = clampNumber(variableCost.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const contribution = unitPriceValue - variableCostValue;
      const units = contribution > 0 ? Math.ceil(fixedCostValue / contribution) : 0;
      const sales = units * unitPriceValue;

      setResultCard(result, {
        label: "손익분기점 수량",
        value: `${formatNumber(units)}개`,
        description: contribution > 0 ? `손익분기점 매출은 ${formatWon(sales)}입니다.` : "판매가가 변동비보다 커야 계산할 수 있습니다.",
        meta: [
          { label: "고정비", value: formatWon(fixedCostValue) },
          {
            labelHtml:
              '<span class="label-with-help"><span>단위당 공헌이익</span><span class="help-tooltip"><button class="help-trigger" type="button" aria-label="단위당 공헌이익 설명 보기">!</button><span class="help-bubble" role="tooltip">제품 한 개를 팔았을 때 판매가에서 단위당 변동비를 뺀 금액입니다.</span></span></span>',
            value: formatWon(Math.max(contribution, 0)),
          },
          { label: "손익분기점 매출", value: formatWon(sales) },
        ],
      });
    };

    [fixedCost, unitPrice, variableCost].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );

    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.breakeven = initBreakevenPage;
})();
