(function () {
  const {
    clampNumber,
    formatManwonInput,
    formatWon,
    parseManwonInput,
    formatNumber,
    constants,
  } = window.LifeCalcUtils;

  function initLoanDetailPage() {
    const principal = document.getElementById("loanPrincipal");
    const rate = document.getElementById("loanRate");
    const months = document.getElementById("loanMonths");
    const type = document.getElementById("loanType");
    const graceMonths = document.getElementById("loanGraceMonths");
    const prepayMonth = document.getElementById("loanPrepayMonth");
    const prepayAmount = document.getElementById("loanPrepayAmount");
    const result = document.getElementById("loanDetailResult");

    if (!principal || !rate || !months || !type || !graceMonths || !prepayMonth || !prepayAmount || !result) {
      return;
    }

    const render = () => {
      const principalValue = parseManwonInput(principal.value);
      const annualRate = clampNumber(rate.value, 0, constants.MAX_LOAN_RATE, 0) / 100;
      const monthValue = clampNumber(months.value, 1, constants.MAX_LOAN_MONTHS, 1);
      const repaymentType = type.value || "amortized";
      const graceValue = Math.min(clampNumber(graceMonths.value, 0, 120, 0), Math.max(monthValue - 1, 0));
      const prepayMonthValue = clampNumber(prepayMonth.value, 0, monthValue, 0);
      const prepayAmountValue = parseManwonInput(prepayAmount.value);

      if (!principalValue || !monthValue) {
        result.innerHTML = "";
        return;
      }

      const schedule = buildLoanSchedule({
        principal: principalValue,
        annualRate,
        months: monthValue,
        type: repaymentType,
        graceMonths: graceValue,
        prepayMonth: prepayMonthValue,
        prepayAmount: prepayAmountValue,
      });

      const firstMonth = schedule[0];
      const graceMonth = graceValue > 0 ? schedule[Math.min(graceValue - 1, schedule.length - 1)] : null;
      const repaymentStartMonth = schedule[Math.min(graceValue, schedule.length - 1)];
      const lastMonth = schedule[schedule.length - 1];
      const totalPaid = schedule.reduce((sum, item) => sum + item.payment + item.prepayment, 0);
      const totalInterest = schedule.reduce((sum, item) => sum + item.interest, 0);
      const totalPrepayment = schedule.reduce((sum, item) => sum + item.prepayment, 0);

      result.innerHTML = `
        <div class="premium-payslip-grid">
          <article class="premium-payslip-summary">
            <span>첫 납입월</span>
            <strong>${formatWon(firstMonth.payment + firstMonth.prepayment)}</strong>
            <p>입력한 상환 방식 기준으로 계산한 첫 달 납입 예상액입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>본상환 시작월</span>
            <strong>${formatWon(repaymentStartMonth.payment + repaymentStartMonth.prepayment)}</strong>
            <p>거치기간이 있다면 원금 상환이 시작되는 첫 달 기준 금액입니다.</p>
          </article>
          <article class="premium-payslip-summary">
            <span>마지막 달</span>
            <strong>${formatWon(lastMonth.payment + lastMonth.prepayment)}</strong>
            <p>상환 마지막 달에 실제로 빠져나가는 예상 금액입니다.</p>
          </article>
        </div>
        <div class="premium-breakdown-grid">
          <article class="premium-breakdown-card">
            <h4>월별 흐름 요약</h4>
            <dl class="premium-breakdown-list">
              <div><dt>거치기간</dt><dd>${formatNumber(graceValue)}개월</dd></div>
              <div><dt>거치 마지막 달</dt><dd>${graceMonth ? formatWon(graceMonth.payment) : "없음"}</dd></div>
              <div><dt>중도상환 시점</dt><dd>${prepayMonthValue > 0 ? `${formatNumber(prepayMonthValue)}개월차` : "없음"}</dd></div>
              <div><dt>중도상환 금액</dt><dd>${prepayMonthValue > 0 ? formatWon(totalPrepayment) : "없음"}</dd></div>
              <div><dt>남은 원금 종료값</dt><dd>${formatWon(lastMonth.balance)}</dd></div>
            </dl>
          </article>
          <article class="premium-breakdown-card">
            <h4>총 비용</h4>
            <dl class="premium-breakdown-list">
              <div><dt>총 상환액</dt><dd>${formatWon(totalPaid)}</dd></div>
              <div><dt>총 이자</dt><dd>${formatWon(totalInterest)}</dd></div>
              <div><dt>원금 상환액</dt><dd>${formatWon(principalValue)}</dd></div>
              <div><dt>상환 기간</dt><dd>${formatNumber(monthValue)}개월</dd></div>
              <div><dt>상환 방식</dt><dd>${getTypeLabel(repaymentType)}</dd></div>
            </dl>
          </article>
        </div>
      `;
    };

    [principal, prepayAmount].forEach((input) =>
      input.addEventListener("input", () => {
        input.value = formatManwonInput(input.value);
        render();
      })
    );

    [rate, months, graceMonths, prepayMonth].forEach((input) =>
      input.addEventListener("input", () => {
        render();
      })
    );

    type.addEventListener("change", render);

    principal.value = formatManwonInput(principal.value);
    prepayAmount.value = formatManwonInput(prepayAmount.value);
    render();
  }

  function buildLoanSchedule(config) {
    const schedule = [];
    const monthlyRate = config.annualRate / 12;
    let balance = config.principal;
    const graceMonths = Math.min(config.graceMonths, Math.max(config.months - 1, 0));
    const repayMonths = Math.max(config.months - graceMonths, 1);
    const equalPrincipalBase = config.type === "equalPrincipal" ? balance / repayMonths : 0;

    for (let month = 1; month <= config.months; month += 1) {
      const interest = balance * monthlyRate;
      let principalPayment = 0;
      let payment = 0;

      if (config.type === "bullet") {
        payment = interest;
        if (month === config.months) {
          principalPayment = balance;
          payment += principalPayment;
        }
      } else if (month <= graceMonths) {
        payment = interest;
      } else if (config.type === "equalPrincipal") {
        principalPayment = Math.min(equalPrincipalBase, balance);
        payment = interest + principalPayment;
      } else {
        const monthsLeft = config.months - month + 1;
        const monthlyPayment = getAmortizedPayment(balance, monthlyRate, monthsLeft);
        principalPayment = Math.min(monthlyPayment - interest, balance);
        payment = interest + principalPayment;
      }

      balance = Math.max(balance - principalPayment, 0);

      let extraPayment = 0;
      if (config.prepayMonth > 0 && month === config.prepayMonth && balance > 0) {
        extraPayment = Math.min(config.prepayAmount, balance);
        balance = Math.max(balance - extraPayment, 0);
      }

      if (config.type === "bullet" && month < config.months) {
        principalPayment = 0;
      }

      schedule.push({
        month,
        interest,
        principal: principalPayment,
        payment,
        prepayment: extraPayment,
        balance,
      });
    }

    return schedule;
  }

  function getAmortizedPayment(balance, monthlyRate, monthsLeft) {
    if (monthsLeft <= 0) {
      return balance;
    }
    if (monthlyRate === 0) {
      return balance / monthsLeft;
    }
    return (balance * monthlyRate * (1 + monthlyRate) ** monthsLeft) / ((1 + monthlyRate) ** monthsLeft - 1);
  }

  function getTypeLabel(type) {
    if (type === "equalPrincipal") {
      return "원금균등";
    }
    if (type === "bullet") {
      return "만기일시상환";
    }
    return "원리금균등";
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages["loan-detail"] = initLoanDetailPage;
})();
