(function () {
  const { bindShare } = window.LifeCalcUtils;
  const page = document.body.dataset.calculator;
  const pages = window.LifeCalcPages || {};

  bindShare();

  if (page && typeof pages[page] === "function") {
    pages[page]();
  }
})();
