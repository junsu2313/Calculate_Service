(function () {
  const {
    formatDateInputValue,
    getMonthDayDiff,
    parseDateInput,
    setResultCard,
  } = window.LifeCalcUtils;

  function initDatePage() {
    const start = document.getElementById("dateStart");
    const end = document.getElementById("dateEnd");
    const result = document.getElementById("dateResult");

    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
    start.value = formatDateInputValue(today);
    end.value = formatDateInputValue(nextMonth);

    const render = () => {
      const startDate = parseDateInput(start.value);
      const endDate = parseDateInput(end.value);

      if (!startDate || !endDate) {
        setResultCard(result, {
          label: "총 날짜 차이",
          value: "입력 필요",
          description: "날짜를 YYYY-MM-DD 형식으로 입력해 주세요.",
        });
        return;
      }

      const diff = endDate.getTime() - startDate.getTime();
      const days = Math.round(diff / 86400000);
      const absDays = Math.abs(days);
      const relation = days >= 0 ? "이후" : "이전";
      const earlierDate = days >= 0 ? startDate : endDate;
      const laterDate = days >= 0 ? endDate : startDate;
      const monthDay = getMonthDayDiff(earlierDate, laterDate);

      setResultCard(result, {
        label: "총 날짜 차이",
        value: `${absDays}일`,
        description: `${relation} 기간 기준으로 ${Math.floor(absDays / 7)}주 ${absDays % 7}일입니다.`,
        meta: [
          { label: "주 단위", value: `${Math.floor(absDays / 7)}주 ${absDays % 7}일` },
          { label: "개월 기준", value: `${monthDay.months}개월 ${monthDay.days}일` },
        ],
      });
    };

    [start, end].forEach((input) => input.addEventListener("input", render));
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.date = initDatePage;
})();
