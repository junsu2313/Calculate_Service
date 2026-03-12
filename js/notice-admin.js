(function () {
  const form = document.getElementById("noticeAdminForm");
  const category = document.getElementById("noticeCategory");
  const shortTitle = document.getElementById("noticeShortTitle");
  const title = document.getElementById("noticeTitle");
  const body = document.getElementById("noticeBody");
  const feedback = document.getElementById("noticeAdminFeedback");
  const connectButton = document.getElementById("noticeConnectButton");

  if (!form || !category || !shortTitle || !title || !body || !feedback || !connectButton) {
    return;
  }

  let fileHandle = null;

  connectButton.addEventListener("click", async () => {
    if (!window.showOpenFilePicker) {
      setFeedback("이 브라우저에서는 파일 연결 대신 JSON 다운로드 방식으로 동작합니다.", "success");
      return;
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: "공지 데이터",
            accept: { "application/json": [".json"] },
          },
        ],
      });

      fileHandle = handle;
      setFeedback("공지 데이터 파일을 연결했습니다.", "success");
    } catch {
      setFeedback("파일 연결을 취소했습니다.", "error");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!shortTitle.value.trim() || !title.value.trim() || !body.value.trim()) {
      setFeedback("목록 제목, 공지 제목, 공지 내용을 모두 입력해 주세요.", "error");
      return;
    }

    const today = new Date();
    const date = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const notice = {
      id: `notice-${date}-${Date.now()}`,
      date,
      short_date: date.slice(5),
      short_title: shortTitle.value.trim(),
      category: category.value,
      title: title.value.trim(),
      body: body.value.trim(),
    };

    try {
      const response = await fetch("../../data/notices.json", { cache: "no-store" });
      const current = (await response.json()) || [];
      const next = [notice, ...current];

      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(`${JSON.stringify(next, null, 2)}\n`);
        await writable.close();
        form.reset();
        setFeedback("공지 데이터 파일에 바로 반영했습니다. 이후 배포만 진행하면 됩니다.", "success");
        return;
      }

      downloadJson(next);
      form.reset();
      setFeedback("갱신된 notices.json 파일을 내려받았습니다. data/notices.json과 교체하면 됩니다.", "success");
    } catch {
      setFeedback("공지 데이터를 불러오지 못했습니다. 로컬 서버 상태를 확인해 주세요.", "error");
    }
  });

  function downloadJson(data) {
    const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "notices.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function setFeedback(message, tone) {
    feedback.textContent = message;
    feedback.dataset.tone = tone;
  }
})();
