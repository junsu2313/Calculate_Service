(function () {
  const savedCalculatorsKey = "life-calculator-saved-list";
  const calculatorCatalog = window.LifeCalcCatalog || {};

  function initHomePage() {
    const savedContainer = document.getElementById("savedCalculators");
    const savedEmptyState = document.getElementById("savedEmptyState");
    const savedCountLabel = document.getElementById("savedCountLabel");
    const clearSavedCalculators = document.getElementById("clearSavedCalculators");
    const addButtons = Array.from(document.querySelectorAll(".add-calculator-btn"));
    let savedKeys = loadSavedCalculators();

    window.LifeCalcUtils.bindShare();

    addButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.key;
        if (!key || savedKeys.includes(key)) {
          return;
        }

        savedKeys = [...savedKeys, key];
        persistSavedCalculators(savedKeys);
        renderSavedCalculators();
        updateAddButtons();
      });
    });

    if (clearSavedCalculators) {
      clearSavedCalculators.addEventListener("click", () => {
        savedKeys = [];
        persistSavedCalculators(savedKeys);
        renderSavedCalculators();
        updateAddButtons();
      });
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

        const link = document.createElement("a");
        link.className = "saved-bar";
        link.href = item.href;
        link.textContent = item.title;
        savedContainer.appendChild(link);
      });
    }

    function updateAddButtons() {
      addButtons.forEach((button) => {
        const active = savedKeys.includes(button.dataset.key);
        button.disabled = active;
        button.textContent = active ? "추가 완료" : "내 목록에 추가";
      });
    }

    renderSavedCalculators();
    updateAddButtons();
  }

  function loadSavedCalculators() {
    try {
      const saved = JSON.parse(localStorage.getItem(savedCalculatorsKey));
      return Array.isArray(saved) ? saved.filter((key) => key in calculatorCatalog) : [];
    } catch {
      return [];
    }
  }

  function persistSavedCalculators(savedKeys) {
    localStorage.setItem(savedCalculatorsKey, JSON.stringify(savedKeys));
  }

  window.LifeCalcHome = { initHomePage };
})();
