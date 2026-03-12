const currency = new Intl.NumberFormat("ko-KR");
const MAX_MANWON_INPUT = 9999999999;
const MAX_LOAN_RATE = 100;
const MAX_LOAN_MONTHS = 600;
const MAX_HEIGHT_CM = 300;
const MAX_WEIGHT_KG = 500;
const MAX_DEPENDENTS = 10;
const MAX_CHILDREN = 10;

function formatWon(value) {
  return `${currency.format(Math.round(value))}원`;
}

function clampNumber(value, min, max, fallback = min) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(Math.max(numeric, min), max);
}

function parseManwonInput(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? Math.min(Number(digits), MAX_MANWON_INPUT) * 10000 : 0;
}

function formatManwonInput(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? currency.format(Math.min(Number(digits), MAX_MANWON_INPUT)) : "";
}

function bindShare() {
  const shareButton = document.getElementById("shareButton");
  if (!shareButton) {
    return;
  }

  shareButton.addEventListener("click", async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      shareButton.textContent = "복사 완료";
      window.setTimeout(() => {
        shareButton.textContent = "링크 복사";
      }, 1500);
    } catch {
      window.prompt("이 링크를 복사하세요.", url);
    }
  });
}

function initSalaryPage() {
  const annual = document.getElementById("salaryAnnual");
  const taxFree = document.getElementById("salaryFree");
  const dependents = document.getElementById("salaryDependents");
  const children = document.getElementById("salaryChildren");
  const result = document.getElementById("salaryResult");

  const render = () => {
    const annualValue = parseManwonInput(annual.value);
    const taxFreeValue = parseManwonInput(taxFree.value);
    const dependentValue = clampNumber(dependents.value, 1, MAX_DEPENDENTS, 1);
    const childValue = clampNumber(children.value, 0, MAX_CHILDREN, 0);
    const monthlyGross = annualValue / 12;
    const taxableMonthly = Math.max(monthlyGross - taxFreeValue, 0);
    const pension = taxableMonthly * 0.045;
    const health = taxableMonthly * 0.03545;
    const care = health * 0.1295;
    const employment = taxableMonthly * 0.009;
    const deductionFactor = 1 - Math.min((dependentValue - 1) * 0.015 + childValue * 0.01, 0.08);
    const incomeTax = taxableMonthly * 0.028 * deductionFactor;
    const localTax = incomeTax * 0.1;
    const totalDeduction = pension + health + care + employment + incomeTax + localTax;
    const net = monthlyGross - totalDeduction;

    result.innerHTML = `
      <span>예상 월 실수령액</span>
      <strong>${formatWon(net)}</strong>
      <p>간이 추정치이며 실제 급여명세서와 차이가 있을 수 있습니다.</p>
      <div class="result-meta">
        <article><span>세전 월급</span><strong>${formatWon(monthlyGross)}</strong></article>
        <article><span>공제 합계</span><strong>${formatWon(totalDeduction)}</strong></article>
        <article><span>예상 연 실수령액</span><strong>${formatWon(net * 12)}</strong></article>
      </div>
    `;
  };

  [annual, taxFree].forEach((input) =>
    input.addEventListener("input", () => {
      input.value = formatManwonInput(input.value);
      render();
    })
  );

  dependents.addEventListener("input", () => {
    dependents.value = String(clampNumber(dependents.value, 1, MAX_DEPENDENTS, 1));
    render();
  });

  children.addEventListener("input", () => {
    children.value = String(clampNumber(children.value, 0, MAX_CHILDREN, 0));
    render();
  });

  annual.value = formatManwonInput(annual.value);
  taxFree.value = formatManwonInput(taxFree.value);
  dependents.value = String(clampNumber(dependents.value, 1, MAX_DEPENDENTS, 1));
  children.value = String(clampNumber(children.value, 0, MAX_CHILDREN, 0));
  render();
}

function initLoanPage() {
  const principal = document.getElementById("loanPrincipal");
  const rate = document.getElementById("loanRate");
  const months = document.getElementById("loanMonths");
  const type = document.getElementById("loanType");
  const result = document.getElementById("loanResult");

  const render = () => {
    const principalValue = parseManwonInput(principal.value);
    const annualRate = clampNumber(rate.value, 0, MAX_LOAN_RATE, 0) / 100;
    const monthValue = clampNumber(months.value, 1, MAX_LOAN_MONTHS, 1);
    const repaymentType = type ? type.value : "amortized";

    if (!principalValue || !monthValue) {
      result.innerHTML = `
        <span>예상 월 납입액</span>
        <strong>입력 필요</strong>
        <p>원금과 기간을 입력하면 결과가 바로 계산됩니다.</p>
      `;
      return;
    }

    const monthlyRate = annualRate / 12;
    let headline = "예상 월 납입액";
    let mainValue = 0;
    let detailText = "";
    let firstMetaLabel = "총 상환액";
    let firstMetaValue = "";
    let secondMetaLabel = "총 이자";
    let secondMetaValue = "";

    if (repaymentType === "equalPrincipal") {
      const principalPerMonth = principalValue / monthValue;
      const firstMonthPayment = principalPerMonth + principalValue * monthlyRate;
      const lastMonthPayment = principalPerMonth + principalPerMonth * monthlyRate;
      const totalInterest = monthlyRate === 0 ? 0 : ((principalValue * monthlyRate) * (monthValue + 1)) / 2;
      const totalPaid = principalValue + totalInterest;

      headline = "첫 달 납입액";
      mainValue = firstMonthPayment;
      detailText = `마지막 달 납입액은 ${formatWon(lastMonthPayment)}입니다.`;
      firstMetaLabel = "총 상환액";
      firstMetaValue = formatWon(totalPaid);
      secondMetaLabel = "총 이자";
      secondMetaValue = formatWon(totalInterest);
    } else if (repaymentType === "bullet") {
      const monthlyInterest = principalValue * monthlyRate;
      const totalInterest = monthlyInterest * monthValue;
      const maturityPayment = principalValue + monthlyInterest;

      headline = "월 이자 납입액";
      mainValue = monthlyInterest;
      detailText = `만기 상환액은 ${formatWon(maturityPayment)}입니다.`;
      firstMetaLabel = "만기 상환액";
      firstMetaValue = formatWon(maturityPayment);
      secondMetaLabel = "총 이자";
      secondMetaValue = formatWon(totalInterest);
    } else {
      const monthlyPayment =
        monthlyRate === 0
          ? principalValue / monthValue
          : (principalValue * monthlyRate * (1 + monthlyRate) ** monthValue) /
            ((1 + monthlyRate) ** monthValue - 1);
      const totalPaid = monthlyPayment * monthValue;
      const totalInterest = totalPaid - principalValue;

      mainValue = monthlyPayment;
      detailText = "원리금균등 상환 기준의 단순 계산 결과입니다.";
      firstMetaLabel = "총 상환액";
      firstMetaValue = formatWon(totalPaid);
      secondMetaLabel = "총 이자";
      secondMetaValue = formatWon(totalInterest);
    }

    result.innerHTML = `
      <span>${headline}</span>
      <strong>${formatWon(mainValue)}</strong>
      <p>${detailText}</p>
      <div class="result-meta">
        <article><span>${firstMetaLabel}</span><strong>${firstMetaValue}</strong></article>
        <article><span>${secondMetaLabel}</span><strong>${secondMetaValue}</strong></article>
        <article><span>상환 기간</span><strong>${monthValue}개월</strong></article>
      </div>
    `;
  };

  principal.addEventListener("input", () => {
    principal.value = formatManwonInput(principal.value);
    render();
  });

  rate.addEventListener("input", () => {
    rate.value = String(clampNumber(rate.value, 0, MAX_LOAN_RATE, 0));
    render();
  });

  months.addEventListener("input", () => {
    months.value = String(clampNumber(months.value, 1, MAX_LOAN_MONTHS, 1));
    render();
  });

  if (type) {
    type.addEventListener("input", render);
  }

  principal.value = formatManwonInput(principal.value);
  rate.value = String(clampNumber(rate.value, 0, MAX_LOAN_RATE, 0));
  months.value = String(clampNumber(months.value, 1, MAX_LOAN_MONTHS, 1));
  render();
}

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  const [year, month, day] = normalized.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthDayDiff(startDate, endDate) {
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  let months = 0;

  while (true) {
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    if (nextMonth <= endDate) {
      cursor.setMonth(cursor.getMonth() + 1);
      months += 1;
      continue;
    }
    break;
  }

  const days = Math.round((endDate.getTime() - cursor.getTime()) / 86400000);
  return { months, days };
}

function initDatePage() {
  const start = document.getElementById("dateStart");
  const end = document.getElementById("dateEnd");
  const result = document.getElementById("dateResult");

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 30);
  start.value = formatDateInputValue(today);
  end.value = formatDateInputValue(nextMonth);

  const render = () => {
    const startDate = parseDateInput(start.value);
    const endDate = parseDateInput(end.value);

    if (!startDate || !endDate) {
      result.innerHTML = `
        <span>총 날짜 차이</span>
        <strong>입력 필요</strong>
        <p>날짜를 YYYY-MM-DD 형식으로 입력해 주세요.</p>
      `;
      return;
    }

    const diff = endDate.getTime() - startDate.getTime();
    const days = Math.round(diff / 86400000);
    const absDays = Math.abs(days);
    const relation = days >= 0 ? "남은" : "지난";
    const earlierDate = days >= 0 ? startDate : endDate;
    const laterDate = days >= 0 ? endDate : startDate;
    const monthDay = getMonthDayDiff(earlierDate, laterDate);

    result.innerHTML = `
      <span>총 날짜 차이</span>
      <strong>${absDays}일</strong>
      <p>${relation} 기간 기준으로 ${Math.floor(absDays / 7)}주 ${absDays % 7}일입니다.</p>
      <div class="result-meta">
        <article><span>주 단위</span><strong>${Math.floor(absDays / 7)}주 ${absDays % 7}일</strong></article>
        <article><span>개월 기준</span><strong>${monthDay.months}개월 ${monthDay.days}일</strong></article>
      </div>
    `;
  };

  [start, end].forEach((input) => input.addEventListener("input", render));
  render();
}

function initBmiPage() {
  const height = document.getElementById("bmiHeight");
  const weight = document.getElementById("bmiWeight");
  const result = document.getElementById("bmiResult");

  const render = () => {
    const heightNumber = clampNumber(height.value, 0, MAX_HEIGHT_CM, 0);
    const weightNumber = clampNumber(weight.value, 0, MAX_WEIGHT_KG, 0);
    const heightValue = heightNumber / 100;
    const weightValue = weightNumber;

    if (!heightValue || !weightValue) {
      result.innerHTML = `
        <span>BMI 결과</span>
        <strong>입력 필요</strong>
        <p>키와 몸무게를 넣으면 BMI가 바로 계산됩니다.</p>
      `;
      return;
    }

    const bmi = weightValue / (heightValue * heightValue);
    let label = "정상";
    if (bmi < 18.5) label = "저체중";
    if (bmi >= 23) label = "과체중";
    if (bmi >= 25) label = "비만";

    result.innerHTML = `
      <span>현재 BMI</span>
      <strong>${bmi.toFixed(1)}</strong>
      <p>일반적인 분류 기준으로 <strong>${label}</strong> 범주입니다.</p>
      <div class="result-meta">
        <article><span>키</span><strong>${heightNumber}cm</strong></article>
        <article><span>몸무게</span><strong>${weightNumber}kg</strong></article>
        <article><span>참고 범위</span><strong>18.5 - 22.9</strong></article>
      </div>
    `;
  };

  height.addEventListener("input", () => {
    height.value = String(clampNumber(height.value, 0, MAX_HEIGHT_CM, 0));
    render();
  });

  weight.addEventListener("input", () => {
    weight.value = String(clampNumber(weight.value, 0, MAX_WEIGHT_KG, 0));
    render();
  });

  height.value = String(clampNumber(height.value, 0, MAX_HEIGHT_CM, 0));
  weight.value = String(clampNumber(weight.value, 0, MAX_WEIGHT_KG, 0));
  render();
}

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
      result.innerHTML = `
        <span>현재 만나이</span>
        <strong>입력 필요</strong>
        <p>날짜를 YYYY-MM-DD 형식으로 입력해 주세요.</p>
      `;
      return;
    }

    if (birthDate > targetDate) {
      result.innerHTML = `
        <span>현재 만나이</span>
        <strong>입력 오류</strong>
        <p>기준일은 출생일보다 같거나 뒤여야 합니다.</p>
      `;
      return;
    }

    let age = targetDate.getFullYear() - birthDate.getFullYear();
    const birthdayPassed =
      targetDate.getMonth() > birthDate.getMonth() ||
      (targetDate.getMonth() === birthDate.getMonth() && targetDate.getDate() >= birthDate.getDate());

    if (!birthdayPassed) {
      age -= 1;
    }

    const koreanAge = targetDate.getFullYear() - birthDate.getFullYear() + 1;
    const monthDay = getMonthDayDiff(birthDate, targetDate);

    result.innerHTML = `
      <span>현재 만나이</span>
      <strong>${age}세</strong>
      <p>기준일 기준으로 태어난 지 ${monthDay.months}개월 ${monthDay.days}일 지났습니다.</p>
      <div class="result-meta">
        <article><span>연나이</span><strong>${koreanAge}세</strong></article>
        <article><span>기준일</span><strong>${target.value}</strong></article>
      </div>
    `;
  };

  [birth, target].forEach((input) => input.addEventListener("input", render));
  render();
}

function initPercentPage() {
  const base = document.getElementById("percentBase");
  const part = document.getElementById("percentPart");
  const changeFrom = document.getElementById("percentChangeFrom");
  const changeTo = document.getElementById("percentChangeTo");
  const result = document.getElementById("percentResult");

  const render = () => {
    const baseValue = clampNumber(base.value, 0, 1000000000, 0);
    const partValue = clampNumber(part.value, 0, 1000000000, 0);
    const fromValue = clampNumber(changeFrom.value, 0, 1000000000, 0);
    const toValue = clampNumber(changeTo.value, 0, 1000000000, 0);

    const ratio = baseValue ? (partValue / baseValue) * 100 : 0;
    const diff = toValue - fromValue;
    const changeRate = fromValue ? (diff / fromValue) * 100 : 0;

    result.innerHTML = `
      <span>퍼센트 결과</span>
      <strong>${ratio.toFixed(1)}%</strong>
      <p>${partValue}는 ${baseValue}의 ${ratio.toFixed(1)}%입니다.</p>
      <div class="result-meta">
        <article><span>변화량</span><strong>${diff.toFixed(1)}</strong></article>
        <article><span>증감률</span><strong>${changeRate.toFixed(1)}%</strong></article>
      </div>
    `;
  };

  [base, part, changeFrom, changeTo].forEach((input) =>
    input.addEventListener("input", () => {
      input.value = String(clampNumber(input.value, 0, 1000000000, 0));
      render();
    })
  );

  render();
}

function initDiscountPage() {
  const price = document.getElementById("discountPrice");
  const rate = document.getElementById("discountRate");
  const extra = document.getElementById("discountExtra");
  const result = document.getElementById("discountResult");

  const render = () => {
    const priceValue = clampNumber(price.value, 0, 1000000000, 0);
    const rateValue = clampNumber(rate.value, 0, 100, 0);
    const extraValue = clampNumber(extra.value, 0, 1000000000, 0);
    const discountAmount = priceValue * (rateValue / 100);
    const finalPrice = Math.max(priceValue - discountAmount - extraValue, 0);

    result.innerHTML = `
      <span>최종 결제 금액</span>
      <strong>${formatWon(finalPrice)}</strong>
      <p>할인 금액 ${formatWon(discountAmount)}와 추가 할인 ${formatWon(extraValue)}가 반영되었습니다.</p>
      <div class="result-meta">
        <article><span>정가</span><strong>${formatWon(priceValue)}</strong></article>
        <article><span>할인율</span><strong>${rateValue}%</strong></article>
        <article><span>총 할인 금액</span><strong>${formatWon(discountAmount + extraValue)}</strong></article>
      </div>
    `;
  };

  [price, extra].forEach((input) =>
    input.addEventListener("input", () => {
      input.value = String(clampNumber(input.value, 0, 1000000000, 0));
      render();
    })
  );

  rate.addEventListener("input", () => {
    rate.value = String(clampNumber(rate.value, 0, 100, 0));
    render();
  });

  render();
}

const page = document.body.dataset.calculator;
if (page === "salary") initSalaryPage();
if (page === "loan") initLoanPage();
if (page === "date") initDatePage();
if (page === "bmi") initBmiPage();
if (page === "age") initAgePage();
if (page === "percent") initPercentPage();
if (page === "discount") initDiscountPage();

bindShare();
