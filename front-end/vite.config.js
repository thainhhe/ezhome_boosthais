import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Giữ nguyên path /api/...
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, res) => {
            console.log("❌ Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log(
              "🔄 Proxying:",
              req.method,
              req.url,
              "→",
              proxyReq.path
            );
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "✅ Proxy response:",
              req.method,
              req.url,
              "→",
              proxyRes.statusCode
            );
          });
        },
      },
      // Also proxy /users to backend (backend mounts user routes at /users)
      "/users": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep /users path
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, res) => {
            console.log("❌ Proxy error (users):", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log(
              "🔄 Proxying (users):",
              req.method,
              req.url,
              "→",
              proxyReq.path
            );
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "✅ Proxy response (users):",
              req.method,
              req.url,
              "→",
              proxyRes.statusCode
            );
          });
        },
      },
    },
  },
});
