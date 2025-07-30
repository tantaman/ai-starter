import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// Proxy /sync to localhost:4848/sync (including WebSockets)
const zeroProxy = createProxyMiddleware({
  target: "ws://localhost:4848",
  changeOrigin: true,
});
app.use("/sync", zeroProxy);

// Proxy /yjs to localhost:1234 (including WebSockets)
const yjsProxy = createProxyMiddleware({
  target: "ws://localhost:1234",
  changeOrigin: true,
  pathRewrite: {
    "^/yjs": "", // Remove /yjs prefix when forwarding
  },
});
app.use("/yjs", yjsProxy);

const viteProxy = createProxyMiddleware({
  target: "http://localhost:3000",
  changeOrigin: true,
});

// Proxy all other requests to localhost:3000 (including WebSockets)
app.use("/", viteProxy);

const PORT = 8080;
const server = app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log("Routes:");
  console.log("  /sync/* -> http://localhost:4848/sync/*");
  console.log("  /yjs/* -> http://localhost:1234/*");
  console.log("  /* -> http://localhost:3000/*");
});

server.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/sync")) {
    zeroProxy.upgrade(req, socket as any, head);
  } else if (req.url?.startsWith("/yjs")) {
    yjsProxy.upgrade(req, socket as any, head);
  } else {
    viteProxy.upgrade(req, socket as any, head);
  }
});

// Handle server shutdown gracefully
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
