(function () {
  const allowedHosts = new Set(["localhost", "127.0.0.1", "::1"]);

  if (!allowedHosts.has(window.location.hostname)) {
    window.location.replace("/");
  }
})();
