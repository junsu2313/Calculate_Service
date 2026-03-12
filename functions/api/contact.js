export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json({ ok: false, message: "잘못된 요청 형식입니다." }, 400);
    }

    const payload = await context.request.json();
    const name = String(payload?.name || "").trim();
    const email = String(payload?.email || "").trim();
    const message = String(payload?.message || "").trim();

    if (!name) {
      return json({ ok: false, message: "이름을 입력해 주세요." }, 400);
    }

    if (!email) {
      return json({ ok: false, message: "이메일을 입력해 주세요." }, 400);
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return json({ ok: false, message: "올바른 이메일 주소를 입력해 주세요." }, 400);
    }

    if (!message) {
      return json({ ok: false, message: "문의 내용을 입력해 주세요." }, 400);
    }

    if (!context.env.CONTACT_MAILER) {
      return json({ ok: false, message: "메일 전송 설정이 아직 완료되지 않았습니다." }, 500);
    }

    const mailerResponse = await context.env.CONTACT_MAILER.fetch("https://internal/send", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        message,
        site: "calc.underlab.work",
      }),
    });

    if (!mailerResponse.ok) {
      const mailerResult = await safeJson(mailerResponse);
      return json(
        {
          ok: false,
          message: mailerResult?.message || "문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        },
        502
      );
    }

    return json({ ok: true, message: "문의가 전송되었습니다." }, 200);
  } catch {
    return json({ ok: false, message: "문의 전송 중 오류가 발생했습니다." }, 500);
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
  });
}
