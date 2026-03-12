(function () {
  const contactStorageKey = "life-calculator-contact-draft";

  const contactForm = document.getElementById("contactForm");
  const contactName = document.getElementById("contactName");
  const contactEmail = document.getElementById("contactEmail");
  const contactMessage = document.getElementById("contactMessage");
  const contactFeedback = document.getElementById("contactFeedback");
  const contactReset = document.getElementById("contactReset");

  if (!contactForm || !contactName || !contactEmail || !contactMessage || !contactFeedback) {
    return;
  }

  restoreDraft();
  bindContactEvents();

  function bindContactEvents() {
    [contactName, contactEmail, contactMessage].forEach((field) => {
      field.addEventListener("input", saveDraft);
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const validation = validateContactForm();
      if (!validation.valid) {
        setFeedback(validation.message, "error");
        return;
      }

      const subject = `[생활 속 계산기 문의] ${contactName.value.trim()}`;
      const body = [
        `이름: ${contactName.value.trim()}`,
        `이메일: ${contactEmail.value.trim()}`,
        "",
        "[문의 내용]",
        contactMessage.value.trim(),
      ].join("\n");

      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      try {
        window.location.href = mailtoUrl;
        setFeedback("메일 앱으로 문의 내용을 열었습니다.", "success");
      } catch {
        setFeedback("메일 앱을 열지 못했습니다. 내용을 복사해서 사용해 주세요.", "error");
      }

      saveDraft();
    });

    if (contactReset) {
      contactReset.addEventListener("click", () => {
        contactForm.reset();
        sessionStorage.removeItem(contactStorageKey);
        setFeedback("입력한 내용을 지웠습니다.", "success");
      });
    }
  }

  function validateContactForm() {
    if (!contactName.value.trim()) {
      return { valid: false, message: "이름을 입력해 주세요." };
    }

    if (!contactEmail.value.trim()) {
      return { valid: false, message: "이메일을 입력해 주세요." };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(contactEmail.value.trim())) {
      return { valid: false, message: "올바른 이메일 주소를 입력해 주세요." };
    }

    if (!contactMessage.value.trim()) {
      return { valid: false, message: "문의 내용을 입력해 주세요." };
    }

    return { valid: true };
  }

  function saveDraft() {
    const payload = {
      name: contactName.value,
      email: contactEmail.value,
      message: contactMessage.value,
    };

    sessionStorage.setItem(contactStorageKey, JSON.stringify(payload));
  }

  function restoreDraft() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(contactStorageKey)) || {};
      contactName.value = saved.name || "";
      contactEmail.value = saved.email || "";
      contactMessage.value = saved.message || "";
    } catch {
      sessionStorage.removeItem(contactStorageKey);
    }
  }

  function setFeedback(message, tone) {
    contactFeedback.textContent = message;
    contactFeedback.dataset.tone = tone;
  }
})();
