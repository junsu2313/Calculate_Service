(function () {
  const currency = new Intl.NumberFormat("ko-KR");
  const plainNumber = new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 1,
  });

  const constants = {
    MAX_MANWON_INPUT: 9999999999,
    MAX_LOAN_RATE: 100,
    MAX_LOAN_MONTHS: 600,
    MAX_HEIGHT_CM: 300,
    MAX_WEIGHT_KG: 500,
    MAX_DEPENDENTS: 10,
    MAX_CHILDREN: 10,
    MAX_GENERIC_NUMBER: 1000000000,
  };

  function formatWon(value) {
    return `${currency.format(Math.round(value))}원`;
  }

  function formatNumber(value, digits) {
    return Number(value).toLocaleString("ko-KR", {
      minimumFractionDigits: digits ?? 0,
      maximumFractionDigits: digits ?? 0,
    });
  }

  function formatDecimal(value, digits) {
    return plainNumber.format(Number(value).toFixed(digits ?? 1));
  }

  function clampNumber(value, min, max, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return fallback ?? min;
    }
    return Math.min(Math.max(numeric, min), max);
  }

  function parseManwonInput(value) {
    const digits = String(value || "").replace(/[^\d]/g, "");
    return digits ? Math.min(Number(digits), constants.MAX_MANWON_INPUT) * 10000 : 0;
  }

  function formatManwonInput(value) {
    const digits = String(value || "").replace(/[^\d]/g, "");
    return digits ? currency.format(Math.min(Number(digits), constants.MAX_MANWON_INPUT)) : "";
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

  function setResultCard(element, config) {
    const description = config.description ? `<p>${config.description}</p>` : "";
    const meta = Array.isArray(config.meta)
      ? `
        <div class="result-meta">
          ${config.meta
            .map(
              (item) =>
                `<article><span>${item.labelHtml || item.label}</span><strong>${item.value}</strong></article>`
            )
            .join("")}
        </div>
      `
      : "";

    element.innerHTML = `
      <span>${config.label}</span>
      <strong>${config.value}</strong>
      ${description}
      ${meta}
    `;
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
        window.prompt("이 링크를 복사해 주세요.", url);
      }
    });
  }

  window.LifeCalcUtils = {
    constants,
    formatWon,
    formatNumber,
    formatDecimal,
    clampNumber,
    parseManwonInput,
    formatManwonInput,
    parseDateInput,
    formatDateInputValue,
    getMonthDayDiff,
    setResultCard,
    bindShare,
  };
})();
