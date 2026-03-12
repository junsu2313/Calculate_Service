import { EmailMessage } from "cloudflare:email";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return json({ ok: false, message: "허용되지 않은 요청입니다." }, 405);
    }

    try {
      const payload = await request.json();
      const name = String(payload?.name || "").trim();
      const email = String(payload?.email || "").trim();
      const message = String(payload?.message || "").trim();
      const site = String(payload?.site || "calc.underlab.work").trim();

      if (!name || !email || !message) {
        return json({ ok: false, message: "문의 정보가 부족합니다." }, 400);
      }

      const subject = `[생활 속 계산기 문의] ${name}`;
      const plainText = [
        `사이트: ${site}`,
        `이름: ${name}`,
        `이메일: ${email}`,
        "",
        "[문의 내용]",
        message,
      ].join("\r\n");

      const rawMessage = [
        "From: 생활 속 계산기 <contact@calc.underlab.work>",
        "To: junsu9080@gmail.com",
        `Reply-To: ${email}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        plainText,
      ].join("\r\n");

      const emailMessage = new EmailMessage(
        "contact@calc.underlab.work",
        "junsu9080@gmail.com",
        rawMessage
      );

      await env.CONTACT_DELIVERY.send(emailMessage);
      return json({ ok: true }, 200);
    } catch {
      return json({ ok: false, message: "메일 전송 중 오류가 발생했습니다." }, 500);
    }
  },
};

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
  });
}
