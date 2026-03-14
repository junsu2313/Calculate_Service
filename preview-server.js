const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const hubRoot = path.join(root, "Web_hub");
const port = 4173;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

function sendFile(filePath, res, fallbackPath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(fallbackPath, (fallbackError, fallbackData) => {
        if (fallbackError) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not found");
          return;
        }

        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(fallbackData);
      });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
    });
    res.end(data);
  });
}

function sendHubIndex(res) {
  const hubIndexPath = path.join(hubRoot, "index.html");

  fs.readFile(hubIndexPath, "utf8", (error, data) => {
    if (error) {
      sendFile(path.join(root, "index.html"), res, path.join(root, "404.html"));
      return;
    }

    const localHubMarkup = data
      .replace(/\.\/styles\.css/g, "/__hub/styles.css")
      .replace(/\.\/theme\.js/g, "/__hub/theme.js")
      .replace(/https:\/\/calc\.underlab\.work\//g, "/__app/");

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(localHubMarkup);
  });
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "").replace(/\\/g, "/");

    if (safePath === "/") {
      sendHubIndex(res);
      return;
    }

    if (safePath.startsWith("/__hub/")) {
      const hubPath = safePath.replace("/__hub/", "/");
      let hubFilePath = path.join(hubRoot, hubPath);

      if (!path.extname(hubFilePath)) {
        hubFilePath = path.join(hubFilePath, "index.html");
      }

      sendFile(hubFilePath, res, path.join(root, "404.html"));
      return;
    }

    if (safePath.startsWith("/__app/")) {
      const appPath = safePath.replace("/__app/", "/");
      let appFilePath = path.join(root, appPath);

      if (!path.extname(appFilePath)) {
        appFilePath = path.join(appFilePath, "index.html");
      }

      sendFile(appFilePath, res, path.join(root, "404.html"));
      return;
    }

    let filePath = path.join(root, safePath);

    if (!path.extname(filePath)) {
      filePath = path.join(filePath, "index.html");
    }

    sendFile(filePath, res, path.join(root, "404.html"));
  })
  .listen(port, () => {
    console.log(`Preview server running at http://localhost:${port}`);
  });


