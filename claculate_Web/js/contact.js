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

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const validation = validateContactForm();
      if (!validation.valid) {
        setFeedback(validation.message, "error");
        return;
      }

      await submitContactForm();
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

  async function submitContactForm() {
    setFeedback("문의 내용을 전송하고 있습니다.", "success");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: contactName.value.trim(),
          email: contactEmail.value.trim(),
          message: contactMessage.value.trim(),
        }),
      });

      const result = await safeJson(response);
      if (!response.ok || !result?.ok) {
        setFeedback(result?.message || "문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.", "error");
        return;
      }

      contactForm.reset();
      sessionStorage.removeItem(contactStorageKey);
      setFeedback("문의가 전송되었습니다.", "success");
    } catch {
      setFeedback("문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", "error");
    }
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

  async function safeJson(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
})();
