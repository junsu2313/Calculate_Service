(function () {
  const {
    formatDateInputValue,
    getMonthDayDiff,
    parseDateInput,
    setResultCard,
  } = window.LifeCalcUtils;

  function initAgePage() {
    const birth = document.getElementById("ageBirth");
    const target = document.getElementById("ageTarget");
    const result = document.getElementById("ageResult");

    const today = new Date();
    const defaultBirth = new Date(1995, 4, 15);
    birth.value = formatDateInputValue(defaultBirth);
    target.value = formatDateInputValue(today);

    const render = () => {
      const birthDate = parseDateInput(birth.value);
      const targetDate = parseDateInput(target.value);

      if (!birthDate || !targetDate) {
        setResultCard(result, {
          label: "현재 만나이",
          value: "입력 필요",
          description: "날짜를 YYYY-MM-DD 형식으로 입력해 주세요.",
        });
        return;
      }

      if (birthDate > targetDate) {
        setResultCard(result, {
          label: "현재 만나이",
          value: "입력 오류",
          description: "기준일은 출생일보다 같거나 뒤여야 합니다.",
        });
        return;
      }

      let age = targetDate.getFullYear() - birthDate.getFullYear();
      const birthdayPassed =
        targetDate.getMonth() > birthDate.getMonth() ||
        (targetDate.getMonth() === birthDate.getMonth() && targetDate.getDate() >= birthDate.getDate());

      if (!birthdayPassed) {
        age -= 1;
      }

      const yearAge = targetDate.getFullYear() - birthDate.getFullYear() + 1;
      const monthDay = getMonthDayDiff(birthDate, targetDate);

      setResultCard(result, {
        label: "현재 만나이",
        value: `${age}세`,
        description: `출생일 기준으로 ${monthDay.months}개월 ${monthDay.days}일이 지났습니다.`,
        meta: [
          { label: "연나이", value: `${yearAge}세` },
          { label: "기준일", value: target.value },
        ],
      });
    };

    [birth, target].forEach((input) => input.addEventListener("input", render));
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.age = initAgePage;
})();
