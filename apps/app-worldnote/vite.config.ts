import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const sharedSrcDir = path.join(rootDir, "../../packages/pkg-shared/src");

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  clearScreen: false,
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.join(rootDir, "src") },
      {
        find: /^@worldnote\/shared(\/.*)?$/,
        replacement: `${sharedSrcDir.replace(/\\/g, "/")}$1`,
      },
      {
        find: /^@worldnote\/ui(\/.*)?$/,
        replacement: `${path.join(rootDir, "../../packages/pkg-ui/src").replace(/\\/g, "/")}$1`,
      },
    ],
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target:
      process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: process.env.TAURI_DEBUG ? false : "esbuild",
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
