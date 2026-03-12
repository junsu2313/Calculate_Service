const savedCalculatorsKey = "life-calculator-saved-list";

const calculatorCatalog = {
  salary: {
    title: "연봉 실수령액 계산기",
    description: "세전 연봉 기준 월 실수령액 추정을 확인합니다.",
    href: "./calculators/salary/",
  },
  loan: {
    title: "대출 상환 계산기",
    description: "월 납입액과 총 이자를 계산합니다.",
    href: "./calculators/loan/",
  },
  date: {
    title: "날짜 차이 계산기",
    description: "남은 날짜와 개월 환산을 확인합니다.",
    href: "./calculators/date/",
  },
  bmi: {
    title: "BMI 계산기",
    description: "BMI와 기본 분류를 바로 확인합니다.",
    href: "./calculators/bmi/",
  },
  age: {
    title: "만나이 계산기",
    description: "출생일 기준 만나이와 생활연령을 확인합니다.",
    href: "./calculators/age/",
  },
  percent: {
    title: "퍼센트 계산기",
    description: "비율, 증가율, 감소율을 빠르게 계산합니다.",
    href: "./calculators/percent/",
  },
  discount: {
    title: "할인율 계산기",
    description: "정가와 할인율 기준 최종 결제 금액을 확인합니다.",
    href: "./calculators/discount/",
  },
};

const shareButton = document.getElementById("shareButton");
const savedContainer = document.getElementById("savedCalculators");
const savedEmptyState = document.getElementById("savedEmptyState");
const savedCountLabel = document.getElementById("savedCountLabel");
const clearSavedCalculators = document.getElementById("clearSavedCalculators");
const addButtons = Array.from(document.querySelectorAll(".add-calculator-btn"));

let savedKeys = loadSavedCalculators();

bindShare();
bindCalculatorActions();
renderSavedCalculators();
updateAddButtons();

function bindShare() {
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
      }, 1600);
    } catch {
      window.prompt("이 링크를 복사하세요.", url);
    }
  });
}

function bindCalculatorActions() {
  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.key;
      if (!key || savedKeys.includes(key)) {
        return;
      }

      savedKeys = [...savedKeys, key];
      persistSavedCalculators();
      renderSavedCalculators();
      updateAddButtons();
    });
  });

  if (clearSavedCalculators) {
    clearSavedCalculators.addEventListener("click", () => {
      savedKeys = [];
      persistSavedCalculators();
      renderSavedCalculators();
      updateAddButtons();
    });
  }
}

function renderSavedCalculators() {
  if (!savedContainer || !savedEmptyState || !savedCountLabel) {
    return;
  }

  savedContainer.innerHTML = "";
  savedCountLabel.textContent = `${savedKeys.length}개`;

  if (!savedKeys.length) {
    savedEmptyState.hidden = false;
    return;
  }

  savedEmptyState.hidden = true;

  savedKeys.forEach((key) => {
    const item = calculatorCatalog[key];
    if (!item) {
      return;
    }

    const article = document.createElement("article");
    article.className = "saved-card";
    article.innerHTML = `
      <div>
        <strong>${item.title}</strong>
        <p>${item.description}</p>
      </div>
      <div class="saved-card-actions">
        <a class="text-link" href="${item.href}">계산기 열기</a>
        <button class="ghost-btn remove-calculator-btn" type="button" data-key="${key}">삭제</button>
      </div>
    `;
    savedContainer.appendChild(article);
  });

  Array.from(document.querySelectorAll(".remove-calculator-btn")).forEach((button) => {
    button.addEventListener("click", () => {
      savedKeys = savedKeys.filter((key) => key !== button.dataset.key);
      persistSavedCalculators();
      renderSavedCalculators();
      updateAddButtons();
    });
  });
}

function updateAddButtons() {
  addButtons.forEach((button) => {
    const active = savedKeys.includes(button.dataset.key);
    button.disabled = active;
    button.textContent = active ? "추가됨" : "내 목록에 추가";
  });
}

function loadSavedCalculators() {
  try {
    const saved = JSON.parse(localStorage.getItem(savedCalculatorsKey));
    return Array.isArray(saved) ? saved.filter((key) => key in calculatorCatalog) : [];
  } catch {
    return [];
  }
}

function persistSavedCalculators() {
  localStorage.setItem(savedCalculatorsKey, JSON.stringify(savedKeys));
}
