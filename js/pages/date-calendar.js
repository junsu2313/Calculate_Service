(function () {
  const { formatNumber } = window.LifeCalcUtils;

  function initDateCalendarPage() {
    const monthLabel = document.getElementById("calendarMonthLabel");
    const grid = document.getElementById("dateCalendarGrid");
    const summary = document.getElementById("dateCalendarSummary");
    const prevButton = document.getElementById("calendarPrevMonth");
    const nextButton = document.getElementById("calendarNextMonth");
    const todayButton = document.getElementById("calendarToday");

    if (!monthLabel || !grid || !summary || !prevButton || !nextButton || !todayButton) {
      return;
    }

    const today = startOfDay(new Date());
    let selectedDate = today;
    let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const solarMonthFormatter = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
    });
    const solarFullFormatter = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
    const lunarFormatter = new Intl.DateTimeFormat("ko-KR-u-ca-chinese", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const render = () => {
      monthLabel.textContent = solarMonthFormatter.format(currentMonth);
      renderSummary();
      renderCalendar();
    };

    const renderSummary = () => {
      const lunarInfo = getLunarInfo(selectedDate, lunarFormatter);
      const diffDays = Math.round((selectedDate.getTime() - today.getTime()) / 86400000);
      const relation =
        diffDays === 0 ? "오늘 기준 같은 날" : diffDays > 0 ? `오늘로부터 ${formatNumber(diffDays)}일 후` : `오늘보다 ${formatNumber(Math.abs(diffDays))}일 전`;

      summary.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary">
            <span>선택한 양력 날짜</span>
            <strong>${solarFullFormatter.format(selectedDate)}</strong>
            <p>학교 일정, 계약일, 일반 달력에서 바로 쓰는 기준 날짜입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>선택한 음력 날짜</span>
            <strong>${lunarInfo.label}</strong>
            <p>${lunarInfo.isLeap ? "윤달이 포함된 날짜입니다." : "일반 음력 날짜입니다."}</p>
          </article>
          <article class="premium-payslip-summary">
            <span>오늘 기준</span>
            <strong>${relation}</strong>
          </article>
        </div>
      `;
    };

    const renderCalendar = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const startWeekday = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const cells = [];

      for (let i = 0; i < startWeekday; i += 1) {
        cells.push('<div class="calendar-cell calendar-cell-empty" aria-hidden="true"></div>');
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const lunarInfo = getLunarInfo(date, lunarFormatter);
        const isToday = isSameDate(date, today);
        const isSelected = isSameDate(date, selectedDate);
        const lunarText = lunarInfo.day === "1" ? lunarInfo.monthLabel : `${lunarInfo.day}일`;

        cells.push(`
          <button
            class="calendar-cell${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}"
            type="button"
            data-date="${formatDateInputValue(date)}"
          >
            <span class="calendar-solar-day">${day}</span>
            <span class="calendar-lunar-day">${lunarText}</span>
            ${lunarInfo.isLeap ? '<span class="calendar-lunar-badge">윤달</span>' : ""}
          </button>
        `);
      }

      grid.innerHTML = cells.join("");

      grid.querySelectorAll("[data-date]").forEach((button) => {
        button.addEventListener("click", () => {
          const parsed = parseDateInput(button.getAttribute("data-date"));
          if (!parsed) {
            return;
          }
          selectedDate = startOfDay(parsed);
          currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          render();
        });
      });
    };

    prevButton.addEventListener("click", () => {
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      render();
    });

    nextButton.addEventListener("click", () => {
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      render();
    });

    todayButton.addEventListener("click", () => {
      selectedDate = today;
      currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      render();
    });

    render();
  }

  function getLunarInfo(date, formatter) {
    const parts = formatter.formatToParts(date);
    const year = parts.find((item) => item.type === "relatedYear")?.value || "";
    const yearName = parts.find((item) => item.type === "yearName")?.value || "";
    const monthRaw = parts.find((item) => item.type === "month")?.value || "";
    const day = parts.find((item) => item.type === "day")?.value || "";
    const isLeap = monthRaw.includes("윤");

    return {
      label: `${year}년(${yearName}년) ${monthRaw} ${day}일`,
      monthLabel: monthRaw,
      day,
      isLeap,
    };
  }

  function isSameDate(left, right) {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["date-calendar"] = initDateCalendarPage;
})();
