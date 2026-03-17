const http = require("http");
const https = require("https");
const urlModule = require("url");
const PORT = process.env.PORT || 3001;
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }
  const parsed = urlModule.parse(req.url, true);
  if (parsed.pathname === "/health") { res.writeHead(200); res.end("ok"); return; }
  if (parsed.pathname === "/img") {
    const imageUrl = parsed.query.url;
    if (!imageUrl) { res.writeHead(400); res.end("url manquant"); return; }
    const allowed = ["m.media-amazon.com","ae01.alicdn.com","ae02.alicdn.com","ae03.alicdn.com"];
    if (!allowed.some(d => imageUrl.includes(d))) { res.writeHead(403); res.end("interdit"); return; }
    const t = new URL(imageUrl);
    const opts = { hostname: t.hostname, path: t.pathname + t.search, method: "GET", headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0", "Referer": "https://www.amazon.fr/" }, timeout: 10000 };
    const r = https.request(opts, (pr) => {
      if ([301,302,307,308].includes(pr.statusCode) && pr.headers.location) { res.writeHead(302, { Location: "/img?url=" + encodeURIComponent(pr.headers.location) }); res.end(); return; }
      res.writeHead(pr.statusCode === 200 ? 200 : pr.statusCode, { "Content-Type": pr.headers["content-type"] || "image/jpeg", "Cache-Control": "public, max-age=86400", "Access-Control-Allow-Origin": "*" });
      pr.pipe(res);
    });
    r.on("error", () => { if (!res.headersSent) { res.writeHead(500); res.end("erreur"); } });
    r.end(); return;
  }
  res.writeHead(404); res.end("404");
});
server.listen(PORT, () => console.log("Proxy actif port " + PORT));
