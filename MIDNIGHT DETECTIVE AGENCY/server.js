// Zero-dependency static file server (Node built-ins only), so `npm install` is not needed.
//   npm run server  -> serves the game
//   npm run dev     -> same, plus auto-reloads the browser when you save a file
const http = require("http");
const fs = require("fs");
const path = require("path");

let port = Number(process.env.PORT) || 5177;   // default 5177, so it won't clash with a project on 3000
const DEV = process.argv.includes("--dev");
const ROOT = __dirname;
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".md": "text/markdown" };

const clients = [];   // open browser connections waiting for a reload signal (Server-Sent Events)
const RELOAD_SNIPPET = `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;

const server = http.createServer((req, res) => {
  if (DEV && req.url === "/__reload") {   // browser subscribes here and keeps the connection open
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
    clients.push(res);
    req.on("close", () => clients.splice(clients.indexOf(res), 1));
    return;
  }
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }   // block ../ path tricks

  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    const type = TYPES[path.extname(file)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    if (DEV && type === "text/html") data = data.toString().replace("</body>", RELOAD_SNIPPET + "</body>");
    res.end(data);
  });
});

if (DEV) {   // tell every connected browser to reload when any file changes (debounced)
  let timer;
  fs.watch(ROOT, { recursive: true }, (_, name) => {
    if (!name || name.includes("node_modules")) return;
    clearTimeout(timer);
    timer = setTimeout(() => clients.forEach(c => c.write("data: reload\n\n")), 100);
  });
}

// If the port is busy, try the next one automatically instead of crashing.
server.on("error", err => {
  if (err.code === "EADDRINUSE") { console.log(`Port ${port} is busy, trying ${port + 1}...`); port++; start(); }
  else throw err;
});
function start() {
  server.listen(port, () => console.log(`MIDNIGHT DETECTIVE AGENCY running at http://localhost:${port}${DEV ? "  (live reload on)" : ""}`));
}
start();
