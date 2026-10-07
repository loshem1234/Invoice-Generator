// Minimal static file server for LuxCraft Invoices (no dependencies).
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "public");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname); }
  catch { res.writeHead(400); return res.end("Bad request"); }
  if (urlPath === "/health") { res.writeHead(200, { "Content-Type": "text/plain" }); return res.end("ok"); }
  if (urlPath.endsWith("/")) urlPath += "index.html";

  const file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }

  fs.readFile(file, (err, data) => {
    if (err) {
      // Unknown paths fall back to the app
      return fs.readFile(path.join(ROOT, "index.html"), (e2, html) => {
        if (e2) { res.writeHead(500); return res.end("Server error"); }
        res.writeHead(200, { "Content-Type": TYPES[".html"], "Cache-Control": "no-cache" });
        res.end(html);
      });
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    });
    res.end(data);
  });
}).listen(PORT, "0.0.0.0", () => console.log(`LuxCraft Invoices running on port ${PORT}`));
