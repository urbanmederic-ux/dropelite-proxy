
const http = require("http");
const https = require("https");
const url = require("url");

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(200); res.end("ok"); return; }

  const parsed = url.parse(req.url, true);

  if (parsed.pathname === "/health") { res.writeHead(200); res.end("ok"); return; }

  if (parsed.pathname === "/img") {
    const imageUrl = parsed.query.url;
    if (!imageUrl) { res.writeHead(400); res.end("missing url"); return; }

    const allowed = ["m.media-amazon.com", "ae01.alicdn.com", "ae02.alicdn.com", "ae03.alicdn.com"];
    if (!allowed.some(d => imageUrl.includes(d))) { res.writeHead(403); res.end("forbidden"); return; }

    const t = new URL(imageUrl);
    const options = { hostname: t.hostname, path: t.pathname + t.search, method: "GET", headers: { "User-Agent": "Mozilla/5.0" } };

    const r = https.request(options, (pr) => {
      if ([301,302,307,308].includes(pr.statusCode) && pr.headers.location) {
        res.writeHead(302, { "Location": "/im
