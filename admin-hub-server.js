const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { spawnSync } = require("child_process");

const calcRoot = __dirname;
const hubRoot = path.join(calcRoot, "Web_hub");
const adminRoot = path.join(calcRoot, "admin_hub");
const noticesPath = path.join(calcRoot, "data", "notices.json");
const host = "127.0.0.1";
const port = 4174;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const repoRegistry = {
  calc: {
    key: "calc",
    title: "생활 속 계산기",
    root: calcRoot,
    href: "http://localhost:4173/__app/",
    summary: "계산기 서비스 운영 현황과 공지 반영 상태를 확인합니다.",
  },
  hub: {
    key: "hub",
    title: "웹 허브",
    root: hubRoot,
    href: "http://localhost:4173/",
    summary: "루트 허브 화면과 기본 연결 상태를 점검합니다.",
  },
};

const releaseKinds = {
  notice: "공지",
  feature: "기능",
};

http
  .createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${host}:${port}`);

    if (url.pathname === "/api/health") {
      return sendJson(res, 200, {
        ok: true,
        host,
        port,
        services: Object.values(repoRegistry).map((repo) => ({
          key: repo.key,
          title: repo.title,
          href: repo.href,
          status: "운영 중",
          summary: repo.summary,
        })),
      });
    }

    if (url.pathname === "/api/notices" && req.method === "GET") {
      try {
        return sendJson(res, 200, { ok: true, notices: loadNotices() });
      } catch {
        return sendJson(res, 500, { ok: false, message: "공지 데이터를 불러오지 못했습니다." });
      }
    }

    if (url.pathname === "/api/git/status" && req.method === "GET") {
      try {
        const repoKey = String(url.searchParams.get("repo") || "").trim();
        if (repoKey && repoRegistry[repoKey]) {
          return sendJson(res, 200, {
            ok: true,
            repo: repoKey,
            status: getGitStatus(repoKey),
          });
        }

        return sendJson(res, 200, {
          ok: true,
          repos: Object.fromEntries(
            Object.keys(repoRegistry).map((key) => [key, getGitStatus(key)])
          ),
        });
      } catch {
        return sendJson(res, 500, { ok: false, message: "Git 상태를 불러오지 못했습니다." });
      }
    }

    if (url.pathname === "/api/notices/publish" && req.method === "POST") {
      return handleNoticePublish(req, res, false);
    }

    if (url.pathname === "/api/notices/publish-and-push" && req.method === "POST") {
      return handleNoticePublish(req, res, true);
    }

    if (url.pathname === "/api/git/publish" && req.method === "POST") {
      try {
        const body = await readJsonBody(req);
        const repoKey = resolveRepoKey(body.repo);
        const kind = resolveKind(body.kind);
        const commitMessage = normalizeCommitMessage(body.message, repoKey, kind);
        const result = runGitPublish(repoKey, commitMessage, true);
        return sendJson(res, 200, {
          ok: true,
          message: `${repoRegistry[repoKey].title} ${releaseKinds[kind]} 배포를 완료했습니다.`,
          commitMessage,
          repo: repoKey,
          kind,
          status: getGitStatus(repoKey),
          repos: Object.fromEntries(
            Object.keys(repoRegistry).map((key) => [key, getGitStatus(key)])
          ),
          log: result,
        });
      } catch (error) {
        return sendJson(res, 500, {
          ok: false,
          message: error.message || "커밋과 푸시 중 오류가 발생했습니다.",
        });
      }
    }

    serveStatic(url.pathname, res);
  })
  .listen(port, host, () => {
    console.log(`Web Hub Admin running at http://${host}:${port}`);
  });

async function handleNoticePublish(req, res, publishWithGit) {
  try {
    const body = await readJsonBody(req);
    const category = String(body.category || "").trim();
    const shortTitle = String(body.shortTitle || "").trim();
    const title = String(body.title || "").trim();
    const message = String(body.body || "").trim();

    if (!category || !shortTitle || !title || !message) {
      return sendJson(res, 400, {
        ok: false,
        message: "구분, 목록 제목, 공지 제목, 공지 내용을 모두 입력해 주세요.",
      });
    }

    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    const notices = loadNotices();
    const nextNotice = {
      id: `notice-${date}-${Date.now()}`,
      date,
      short_date: date.slice(5),
      short_title: shortTitle,
      category,
      title,
      body: message,
    };

    const next = [nextNotice, ...notices];
    fs.writeFileSync(noticesPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");

    if (publishWithGit) {
      const result = runGitPublish("calc", title, false, ["data/notices.json"]);
      return sendJson(res, 200, {
        ok: true,
        message: "생활 속 계산기 공지 반영과 배포를 완료했습니다.",
        notice: nextNotice,
        notices: next,
        commitMessage: title,
        status: getGitStatus("calc"),
        repos: Object.fromEntries(
          Object.keys(repoRegistry).map((key) => [key, getGitStatus(key)])
        ),
        log: result,
      });
    }

    return sendJson(res, 200, {
      ok: true,
      message: "생활 속 계산기 공지 데이터를 로컬에 바로 반영했습니다.",
      notice: nextNotice,
      notices: next,
      status: getGitStatus("calc"),
      repos: Object.fromEntries(
        Object.keys(repoRegistry).map((key) => [key, getGitStatus(key)])
      ),
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      message: error.message || "공지 발행 중 오류가 발생했습니다.",
    });
  }
}

function loadNotices() {
  const raw = fs.readFileSync(noticesPath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function resolveRepoKey(value) {
  const repoKey = String(value || "calc").trim();
  if (!repoRegistry[repoKey]) {
    throw new Error("배포 대상 저장소를 확인해 주세요.");
  }
  return repoKey;
}

function resolveKind(value) {
  const kind = String(value || "feature").trim();
  if (!releaseKinds[kind]) {
    throw new Error("배포 구분을 확인해 주세요.");
  }
  return kind;
}

function normalizeCommitMessage(message, repoKey, kind) {
  const clean = String(message || "").replace(/\s+/g, " ").trim();
  if (clean) {
    return clean;
  }

  const now = new Date();
  return [
    repoRegistry[repoKey].title,
    releaseKinds[kind],
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("-");
}

function getGitStatus(repoKey) {
  const short = runGit(repoKey, ["status", "--short"]);
  const branch = runGit(repoKey, ["branch", "--show-current"]);
  const last = runGit(repoKey, ["log", "-1", "--pretty=%h %s"]);

  return {
    repo: repoKey,
    title: repoRegistry[repoKey].title,
    branch: branch.stdout.trim(),
    lastCommit: last.stdout.trim(),
    pending: short.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

function runGitPublish(repoKey, message, addAll, paths = []) {
  if (addAll) {
    runGit(repoKey, ["add", "-A"]);
  } else if (paths.length) {
    runGit(repoKey, ["add", ...paths]);
  } else {
    throw new Error("추가할 파일이 지정되지 않았습니다.");
  }

  const status = getGitStatus(repoKey);
  if (!status.pending.length) {
    throw new Error("커밋할 변경 사항이 없습니다.");
  }

  const commitResult = runGit(repoKey, ["commit", "-m", message]);
  const pushResult = runGit(repoKey, ["push"]);

  return {
    commit: commitResult.stdout.trim() || commitResult.stderr.trim(),
    push: pushResult.stdout.trim() || pushResult.stderr.trim(),
  };
}

function runGit(repoKey, args) {
  const repo = repoRegistry[repoKey];
  const result = spawnSync("git", args, {
    cwd: repo.root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Git 명령 실행에 실패했습니다.").trim());
  }

  return result;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(urlPath, res) {
  const staticMap = new Map([
    ["/", path.join(adminRoot, "index.html")],
    ["/commits", path.join(adminRoot, "commits.html")],
    ["/admin.css", path.join(adminRoot, "admin.css")],
    ["/app.js", path.join(adminRoot, "app.js")],
    ["/commits.js", path.join(adminRoot, "commits.js")],
    ["/styles.css", path.join(calcRoot, "styles.css")],
    ["/theme.js", path.join(calcRoot, "theme.js")],
  ]);

  const filePath = staticMap.get(urlPath);

  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
}
