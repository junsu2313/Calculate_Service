(function () {
  const {
    clampNumber,
    formatManwonInput,
    parseManwonInput,
    formatWon,
    setResultCard,
    constants,
  } = window.LifeCalcUtils;

  function initFreelancePage() {
    const targetIncome = document.getElementById("freelanceTargetIncome");
    const workDays = document.getElementById("freelanceWorkDays");
    const hoursPerDay = document.getElementById("freelanceHoursPerDay");
    const reserveRate = document.getElementById("freelanceReserveRate");
    const result = document.getElementById("freelanceResult");

    const render = () => {
      const targetIncomeValue = parseManwonInput(targetIncome.value);
      const workDaysValue = clampNumber(workDays.value, 1, 31, 1);
      const hoursValue = clampNumber(hoursPerDay.value, 1, 24, 1);
      const reserveRateValue = clampNumber(reserveRate.value, 0, 100, 0);
      const multiplier = 1 - reserveRateValue / 100;
      const grossMonthly = multiplier > 0 ? targetIncomeValue / multiplier : 0;
      const reserveAmount = grossMonthly - targetIncomeValue;
      const dayRate = grossMonthly / workDaysValue;
      const hourRate = dayRate / hoursValue;

      setResultCard(result, {
        label: "권장 시간당 단가",
        value: formatWon(hourRate),
        description: `목표 월수입을 맞추려면 하루 기준 ${formatWon(dayRate)} 수준이 필요합니다.`,
        meta: [
          { label: "목표 월수입", value: formatWon(targetIncomeValue) },
          { label: "필요 월매출", value: formatWon(grossMonthly) },
          {
            labelHtml:
              '<span class="label-with-help"><span>예비 비용</span><span class="help-tooltip"><button class="help-trigger" type="button" aria-label="예비 비용 설명 보기">!</button><span class="help-bubble" role="tooltip">세금, 플랫폼 수수료, 장비비처럼 실제로 빠질 수 있는 여유 비용 금액입니다.</span></span></span>',
            value: formatWon(reserveAmount),
          },
        ],
      });
    };

    targetIncome.addEventListener("input", () => {
      targetIncome.value = formatManwonInput(targetIncome.value);
      render();
    });

    [workDays, hoursPerDay].forEach((input) => {
      input.addEventListener("input", () => {
        const max = input.id === "freelanceWorkDays" ? 31 : 24;
        input.value = String(clampNumber(input.value, 1, max, 1));
        render();
      });
    });

    reserveRate.addEventListener("input", () => {
      reserveRate.value = String(clampNumber(reserveRate.value, 0, 100, 0));
      render();
    });

    targetIncome.value = formatManwonInput(targetIncome.value);
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.freelance = initFreelancePage;
})();
