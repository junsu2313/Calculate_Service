(function () {
  const serviceGrid = document.getElementById("serviceGrid");
  const noticeList = document.getElementById("noticeList");
  const healthStatus = document.getElementById("healthStatus");
  const form = document.getElementById("adminNoticeForm");
  const feedback = document.getElementById("adminFeedback");
  const resetButton = document.getElementById("adminFormReset");
  const publishAndPushButton = document.getElementById("noticePublishAndPush");
  const category = document.getElementById("noticeCategory");
  const shortTitle = document.getElementById("noticeShortTitle");
  const title = document.getElementById("noticeTitle");
  const body = document.getElementById("noticeBody");

  if (!serviceGrid || !noticeList || !healthStatus || !form || !feedback) {
    return;
  }

  init();

  async function init() {
    await Promise.all([loadHealth(), loadNotices()]);

    resetButton?.addEventListener("click", () => {
      form.reset();
      setFeedback("", "");
    });

    publishAndPushButton?.addEventListener("click", async () => {
      const payload = readForm();
      if (!payload) {
        return;
      }

      await submitNotice("/api/notices/publish-and-push", payload, "공지 반영과 배포를 진행하는 중입니다.");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = readForm();
      if (!payload) {
        return;
      }

      await submitNotice("/api/notices/publish", payload, "공지 데이터를 반영하는 중입니다.");
    });
  }

  function readForm() {
    const payload = {
      category: category.value,
      shortTitle: shortTitle.value.trim(),
      title: title.value.trim(),
      body: body.value.trim(),
    };

    if (!payload.shortTitle || !payload.title || !payload.body) {
      setFeedback("목록 제목, 공지 제목, 공지 내용을 모두 입력해 주세요.", "error");
      return null;
    }

    return payload;
  }

  async function submitNotice(url, payload, pendingMessage) {
    setFeedback(pendingMessage, "success");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        setFeedback(result.message || "공지 반영에 실패했습니다.", "error");
        return;
      }

      form.reset();
      setFeedback(result.message || "공지 데이터를 반영했습니다.", "success");
      renderNotices(result.notices || []);
      renderServicesWithGit(result.repos || null, result.services || null);
    } catch {
      setFeedback("관리자 서버와 연결하지 못했습니다.", "error");
    }
  }

  async function loadHealth() {
    try {
      const [healthResponse, gitResponse] = await Promise.all([
        fetch("/api/health", { cache: "no-store" }),
        fetch("/api/git/status", { cache: "no-store" }),
      ]);
      const healthResult = await healthResponse.json();
      const gitResult = await gitResponse.json();
      if (!healthResult.ok) {
        throw new Error();
      }

      healthStatus.textContent = "로컬 서버 연결됨";
      renderServicesWithGit(gitResult.repos || {}, healthResult.services || []);
    } catch {
      healthStatus.textContent = "연결 확인 필요";
      renderServicesWithGit({}, []);
    }
  }

  async function loadNotices() {
    try {
      const response = await fetch("/api/notices", { cache: "no-store" });
      const result = await response.json();
      renderNotices(result.notices || []);
    } catch {
      noticeList.innerHTML = '<p class="section-caption">공지 데이터를 불러오지 못했습니다.</p>';
    }
  }

  function renderServicesWithGit(repoStatuses, services) {
    if (!Array.isArray(services) || !services.length) {
      serviceGrid.innerHTML = '<p class="section-caption">표시할 서비스가 없습니다.</p>';
      return;
    }

    serviceGrid.innerHTML = services
      .map((service) => {
        const status = repoStatuses?.[service.key] || null;
        const pending = Array.isArray(status?.pending) ? status.pending : [];
        const detailItems = pending.length
          ? pending.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
          : "<li>대기 중인 변경 사항이 없습니다.</li>";

        return `
          <article class="admin-service-card">
            <div class="admin-service-top">
              <strong>${escapeHtml(service.title)}</strong>
              <span class="status-chip">${escapeHtml(service.status)}</span>
            </div>
            <p>${escapeHtml(service.summary)}</p>
            <div class="admin-git-summary">
              <div class="admin-git-line">
                <span>브랜치</span>
                <strong>${escapeHtml(status?.branch || "확인 중")}</strong>
              </div>
              <div class="admin-git-line stacked">
                <span>마지막 커밋</span>
                <strong>${escapeHtml(status?.lastCommit || "확인 중")}</strong>
              </div>
            </div>
            <div class="admin-service-meta">
              <span>${escapeHtml(service.href)}</span>
              <a class="text-link" href="${escapeHtml(service.href)}" target="_blank" rel="noreferrer">열기</a>
            </div>
            <details class="admin-git-detail">
              <summary>Git 상세 정보</summary>
              <div class="admin-git-detail-body">
                <div class="admin-git-line">
                  <span>저장소</span>
                  <strong>${escapeHtml(service.key)}</strong>
                </div>
                <div class="admin-git-line stacked">
                  <span>대기 중인 변경</span>
                  <ul class="admin-git-pending-list">${detailItems}</ul>
                </div>
              </div>
            </details>
          </article>
        `;
      })
      .join("");
  }

  function renderNotices(notices) {
    if (!notices.length) {
      noticeList.innerHTML = '<p class="section-caption">등록된 공지가 없습니다.</p>';
      return;
    }

    noticeList.innerHTML = notices
      .slice(0, 6)
      .map(
        (notice) => `
          <article class="admin-notice-item">
            <div class="admin-notice-top">
              <strong>${escapeHtml(notice.title)}</strong>
              <span>${escapeHtml(notice.date)}</span>
            </div>
            <p>${escapeHtml(notice.body)}</p>
            <div class="admin-notice-meta">
              <span>${escapeHtml(notice.category)}</span>
              <span>${escapeHtml(notice.short_title)}</span>
            </div>
          </article>
        `
      )
      .join("");
  }

  function setFeedback(message, tone) {
    feedback.textContent = message;
    if (tone) {
      feedback.dataset.tone = tone;
      return;
    }

    delete feedback.dataset.tone;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
