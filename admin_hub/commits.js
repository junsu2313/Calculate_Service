(function () {
  const form = document.getElementById("gitPublishForm");
  const repoSelect = document.getElementById("gitRepoSelect");
  const kindSelect = document.getElementById("gitKindSelect");
  const messageInput = document.getElementById("gitCommitMessage");
  const feedback = document.getElementById("gitFeedback");
  const statusChip = document.getElementById("gitStatusChip");
  const statusGrid = document.getElementById("repoStatusGrid");
  const refreshButton = document.getElementById("gitRefreshStatus");

  if (!form || !feedback || !statusChip || !statusGrid || !repoSelect || !kindSelect) {
    return;
  }

  init();

  async function init() {
    await loadStatus();

    refreshButton?.addEventListener("click", loadStatus);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setFeedback("커밋과 푸시를 진행하는 중입니다.", "success");

      try {
        const response = await fetch("/api/git/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repo: repoSelect.value,
            kind: kindSelect.value,
            message: messageInput.value.trim(),
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.ok) {
          setFeedback(result.message || "배포에 실패했습니다.", "error");
          return;
        }

        messageInput.value = "";
        setFeedback(`${result.message} (${result.commitMessage})`, "success");
        applyRepos(result.repos || {});
      } catch {
        setFeedback("관리자 서버와 연결하지 못했습니다.", "error");
      }
    });
  }

  async function loadStatus() {
    try {
      const response = await fetch("/api/git/status", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error();
      }

      applyRepos(result.repos || {});
      setFeedback("", "");
    } catch {
      statusChip.textContent = "상태 확인 실패";
      statusGrid.innerHTML = '<p class="section-caption">Git 상태를 불러오지 못했습니다.</p>';
    }
  }

  function applyRepos(repos) {
    const keys = Object.keys(repos);
    const totalPending = keys.reduce((sum, key) => sum + (repos[key].pending || []).length, 0);
    statusChip.textContent = totalPending ? `변경 ${totalPending}건` : "작업 트리 정리됨";

    if (!keys.length) {
      statusGrid.innerHTML = '<p class="section-caption">표시할 저장소가 없습니다.</p>';
      return;
    }

    statusGrid.innerHTML = keys
      .map((key) => renderRepoCard(repos[key]))
      .join("");
  }

  function renderRepoCard(status) {
    const pendingMarkup = status.pending.length
      ? status.pending
          .map(
            (item) => `
              <article class="admin-notice-item compact">
                <div class="admin-notice-top">
                  <strong>${escapeHtml(item)}</strong>
                </div>
              </article>
            `
          )
          .join("")
      : '<p class="section-caption">커밋 대기 중인 파일이 없습니다.</p>';

    return `
      <article class="mini-card admin-card admin-repo-card">
        <div class="admin-card-head compact">
          <div>
            <p class="mini-label">${escapeHtml(status.repo)}</p>
            <h3>${escapeHtml(status.title)}</h3>
          </div>
          <span class="status-chip">${status.pending.length ? `변경 ${status.pending.length}건` : "정리됨"}</span>
        </div>
        <div class="admin-status-grid">
          <div class="admin-status-item">
            <span>브랜치</span>
            <strong>${escapeHtml(status.branch || "-")}</strong>
          </div>
          <div class="admin-status-item">
            <span>마지막 커밋</span>
            <strong>${escapeHtml(status.lastCommit || "-")}</strong>
          </div>
        </div>
        <div class="admin-pending-block">
          <p class="mini-label">변경 파일</p>
          <div class="admin-notice-list">${pendingMarkup}</div>
        </div>
      </article>
    `;
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
