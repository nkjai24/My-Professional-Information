// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // load .env files based on the current mode (development/production)
  const env = loadEnv(mode, process.cwd(), "");
  // expected env var: VITE_BACKEND_URL=http://localhost:8000 (or :8002, etc)
  const backendBase = env.VITE_BACKEND_URL || "http://localhost:8000";

  return {
    server: {
      host: "::",
      port: 8081, // frontend dev server port
      proxy: {
        // proxy API calls to the backend specified in VITE_BACKEND_URL
        "/process_pdf": {
          target: backendBase,
          changeOrigin: true,
          secure: false,
        },
        "/ask_question": {
          target: "http://localhost:8002",
          changeOrigin: true,
          secure: false,
        },
        "/stt": {
          target: "http://localhost:8002",
          changeOrigin: true,
          secure: false,
        },
        "/api": {
          target: backendBase,
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, "/api"), // optional
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
