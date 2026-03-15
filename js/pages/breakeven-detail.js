(function () {
  const { clampNumber, formatWon, formatNumber, constants } = window.LifeCalcUtils;

  function initBreakevenDetailPage() {
    const fixedCost = document.getElementById("breakevenFixedCost");
    const unitPrice = document.getElementById("breakevenUnitPrice");
    const variableCost = document.getElementById("breakevenVariableCost");
    const expectedUnits = document.getElementById("breakevenExpectedUnits");
    const result = document.getElementById("breakevenDetailResult");

    if (!fixedCost || !unitPrice || !variableCost || !expectedUnits || !result) {
      return;
    }

    const render = () => {
      const fixedCostValue = clampNumber(fixedCost.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const unitPriceValue = clampNumber(unitPrice.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const variableCostValue = clampNumber(variableCost.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const expectedUnitsValue = clampNumber(expectedUnits.value, 0, constants.MAX_GENERIC_NUMBER, 0);
      const contribution = unitPriceValue - variableCostValue;
      const breakevenUnits = contribution > 0 ? Math.ceil(fixedCostValue / contribution) : 0;
      const breakevenSales = breakevenUnits * unitPriceValue;
      const expectedRevenue = expectedUnitsValue * unitPriceValue;
      const expectedCost = fixedCostValue + expectedUnitsValue * variableCostValue;
      const expectedProfit = expectedRevenue - expectedCost;

      if (contribution <= 0) {
        result.innerHTML = `
          <div class="premium-breakdown-grid">
            <article class="premium-breakdown-card">
              <h4>계산 안내</h4>
              <p class="premium-insight-copy">판매가가 단위당 변동비보다 커야 손익분기점을 계산할 수 있습니다.</p>
            </article>
          </div>
        `;
        return;
      }

      const graphMaxUnits = Math.max(10, breakevenUnits, expectedUnitsValue, Math.ceil(breakevenUnits * 1.4));
      const graphMaxAmount = Math.max(
        fixedCostValue,
        graphMaxUnits * unitPriceValue,
        fixedCostValue + graphMaxUnits * variableCostValue
      );

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary">
            <span>손익분기점 수량</span>
            <strong>${formatNumber(breakevenUnits)}개</strong>
            <p>이 수량부터 매출이 총비용을 따라잡기 시작합니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>손익분기점 매출</span>
            <strong>${formatWon(breakevenSales)}</strong>
            <p>손익분기점 수량에 도달했을 때의 예상 매출입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>예상 판매 수량 기준 손익</span>
            <strong>${formatWon(expectedProfit)}</strong>
            <p>${expectedProfit >= 0 ? "손익분기점을 넘는 흑자 구간입니다." : "아직 손익분기점 전 구간입니다."}</p>
          </article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card premium-graph-card">
            <h4>손익분기점 그래프</h4>
            ${renderGraph({
              maxUnits: graphMaxUnits,
              maxAmount: graphMaxAmount,
              fixedCost: fixedCostValue,
              unitPrice: unitPriceValue,
              variableCost: variableCostValue,
              breakevenUnits,
              breakevenSales,
              expectedUnits: expectedUnitsValue,
            })}
          </article>
          <article class="premium-breakdown-card">
            <h4>예상 수량 기준 비교</h4>
            <dl class="premium-breakdown-list">
              <div><dt>예상 판매 수량</dt><dd>${formatNumber(expectedUnitsValue)}개</dd></div>
              <div><dt>예상 매출</dt><dd>${formatWon(expectedRevenue)}</dd></div>
              <div><dt>예상 총비용</dt><dd>${formatWon(expectedCost)}</dd></div>
              <div><dt>월 고정비</dt><dd>${formatWon(fixedCostValue)}</dd></div>
              <div><dt>단위당 공헌이익</dt><dd>${formatWon(contribution)}</dd></div>
              <div><dt>손익분기점까지 차이</dt><dd>${formatNumber(Math.max(breakevenUnits - expectedUnitsValue, 0))}개</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    [fixedCost, unitPrice, variableCost, expectedUnits].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = String(clampNumber(input.value, 0, constants.MAX_GENERIC_NUMBER, 0));
        render();
      })
    );

    render();
  }

  function renderGraph(config) {
    const width = 640;
    const height = 320;
    const padding = { top: 20, right: 20, bottom: 36, left: 52 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const x = (units) => padding.left + (units / config.maxUnits) * innerWidth;
    const y = (amount) => padding.top + innerHeight - (amount / config.maxAmount) * innerHeight;

    const salesLine = [
      [x(0), y(0)],
      [x(config.maxUnits), y(config.maxUnits * config.unitPrice)],
    ];
    const totalCostLine = [
      [x(0), y(config.fixedCost)],
      [x(config.maxUnits), y(config.fixedCost + config.maxUnits * config.variableCost)],
    ];
    const fixedCostLine = [
      [x(0), y(config.fixedCost)],
      [x(config.maxUnits), y(config.fixedCost)],
    ];
    const breakevenPoint = [x(config.breakevenUnits), y(config.breakevenSales)];
    const expectedRevenuePoint = [x(config.expectedUnits), y(config.expectedUnits * config.unitPrice)];

    return `
      <div class="breakeven-graph">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="손익분기점 그래프">
          <line class="breakeven-axis" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" />
          <line class="breakeven-axis" x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" />
          <polyline class="breakeven-line fixed" points="${fixedCostLine.map((point) => point.join(",")).join(" ")}" />
          <polyline class="breakeven-line cost" points="${totalCostLine.map((point) => point.join(",")).join(" ")}" />
          <polyline class="breakeven-line sales" points="${salesLine.map((point) => point.join(",")).join(" ")}" />
          <circle class="breakeven-point" cx="${breakevenPoint[0]}" cy="${breakevenPoint[1]}" r="5" />
          <circle class="breakeven-expected" cx="${expectedRevenuePoint[0]}" cy="${expectedRevenuePoint[1]}" r="5" />
          <text class="breakeven-label" x="${breakevenPoint[0] + 8}" y="${breakevenPoint[1] - 10}">손익분기점</text>
          <text class="breakeven-label" x="${expectedRevenuePoint[0] + 8}" y="${expectedRevenuePoint[1] - 10}">예상 수량</text>
          <text class="breakeven-axis-label" x="${width - padding.right}" y="${height - 10}">판매 수량</text>
          <text class="breakeven-axis-label" x="${padding.left}" y="${padding.top - 4}">금액</text>
        </svg>
        <div class="breakeven-legend">
          <span><i class="sales"></i>매출선</span>
          <span><i class="cost"></i>총비용선</span>
          <span><i class="fixed"></i>고정비선</span>
        </div>
      </div>
    `;
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["breakeven-detail"] = initBreakevenDetailPage;
})();
