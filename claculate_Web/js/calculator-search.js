(function () {
  const categoryMap = {
    salary: "금융",
    loan: "금융",
    freelance: "금융",
    date: "생활",
    age: "생활",
    bmi: "생활",
    percent: "생활",
    discount: "쇼핑",
    vat: "사업",
    margin: "사업",
    breakeven: "사업",
    settlement: "사업",
    estimate: "사업",
    fixedcost: "사업",
  };

  function initCalculatorSearchPage() {
    const catalog = window.LifeCalcCatalog || {};
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const input = document.getElementById("calculatorSearch");
    const count = document.getElementById("calculatorSearchResultsCount");
    const list = document.getElementById("calculatorSearchResultsList");
    const empty = document.getElementById("calculatorSearchEmpty");

    if (!input || !count || !list || !empty) {
      return;
    }

    input.value = query;
    const matchedEntries = searchCatalogEntries(catalog, query);
    count.textContent = `${matchedEntries.length}개`;

    if (!matchedEntries.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    list.innerHTML = matchedEntries.map(renderSearchRow).join("");

    if (window.LifeCalcHome) {
      window.LifeCalcHome.initHomePage();
    }
  }

  function searchCatalogEntries(catalog, query) {
    const tokens = tokenize(query);
    if (!tokens.length) {
      return Object.entries(catalog).map(([key, item]) => ({ key, ...item }));
    }

    const categoryWords = ["금융", "생활", "쇼핑", "사업"];
    const normalizedCategories = categoryWords.map((item) => item.toLowerCase());
    const matchedCategories = categoryWords.filter((category) => tokens.includes(category.toLowerCase()));
    const searchTokens = tokens.filter((token) => !normalizedCategories.includes(token));

    return Object.entries(catalog)
      .map(([key, item]) => ({ key, ...item }))
      .filter((entry) => {
        const category = categoryMap[entry.key] || "";
        const text = `${category} ${entry.title} ${entry.description}`.toLowerCase();
        const words = text.split(/\s+/);
        const categoryMatched = matchedCategories.length === 0 || matchedCategories.includes(category);
        const tokenMatched =
          searchTokens.length === 0 ||
          searchTokens.every((token) => words.some((word) => word.includes(token) || token.includes(word)));
        return categoryMatched && tokenMatched;
      });
  }

  function tokenize(value) {
    return String(value)
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);
  }

  function renderSearchRow(entry) {
    const category = categoryMap[entry.key] || "기타";
    return `
      <article class="directory-row">
        <div class="directory-cell directory-category">${category}</div>
        <div class="directory-cell directory-title"><a class="directory-title-link" href="${entry.href}"><strong>${entry.title}</strong></a></div>
        <div class="directory-cell directory-description">${entry.description}</div>
        <div class="directory-cell directory-actions">
          <a class="text-link" href="${entry.href}">열기</a>
          <button class="ghost-btn add-calculator-btn" type="button" data-key="${entry.key}">추가</button>
        </div>
      </article>
    `;
  }

  window.LifeCalcSearch = { initCalculatorSearchPage };
})();
