(function () {
  const themeStorageKey = "life-calculator-theme";

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(themeStorageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeStorageKey, theme);

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#11141a" : "#f7f1e8");
    }

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.textContent = theme === "dark" ? "라이트 모드" : "다크 모드";
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }

  function initThemeToggle() {
    applyTheme(getPreferredTheme());

    const toggle = document.getElementById("themeToggle");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  initThemeToggle();
})();
