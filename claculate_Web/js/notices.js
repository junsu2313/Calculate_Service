(function () {
  const tabList = document.getElementById("noticeDateList");
  const contentCard = document.getElementById("noticeContentCard");

  if (!tabList || !contentCard) {
    return;
  }

  fetch("../data/notices.json", { cache: "no-store" })
    .then((response) => response.json())
    .then((notices) => {
      const items = Array.isArray(notices) ? notices : [];
      if (!items.length) {
        contentCard.innerHTML = "<p>등록된 공지사항이 없습니다.</p>";
        return;
      }

      render(items);
      activateNotice(items[0].id);
    })
    .catch(() => {
      contentCard.innerHTML = "<p>공지사항을 불러오지 못했습니다.</p>";
    });

  function render(notices) {
    tabList.innerHTML = notices
      .map(
        (notice) => `
          <button class="notice-date-tab" type="button" role="tab" data-notice-target="${notice.id}">
            <span>${notice.short_date}</span>
            <strong>${notice.short_title}</strong>
          </button>
        `
      )
      .join("");

    contentCard.innerHTML = notices
      .map(
        (notice) => `
          <article class="notice-panel" id="${notice.id}" role="tabpanel" hidden>
            <div class="notice-meta">
              <strong>${notice.category}</strong>
              <span>${notice.date}</span>
            </div>
            <h2>${notice.title}</h2>
            <p>${notice.body}</p>
          </article>
        `
      )
      .join("");

    Array.from(document.querySelectorAll(".notice-date-tab")).forEach((tab) => {
      tab.addEventListener("click", () => {
        activateNotice(tab.dataset.noticeTarget);
      });
    });
  }

  function activateNotice(id) {
    const tabs = Array.from(document.querySelectorAll(".notice-date-tab"));
    const panels = Array.from(document.querySelectorAll(".notice-panel"));

    tabs.forEach((tab) => {
      const active = tab.dataset.noticeTarget === id;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== id;
    });
  }
})();
