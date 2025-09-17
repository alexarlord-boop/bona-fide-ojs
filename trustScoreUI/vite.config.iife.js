import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import i18nExtractKeys from "./i18nExtractKeys.vite.js";

// https://vitejs.dev/config/
export default defineConfig({
  target: "es2016",
  plugins: [i18nExtractKeys(), vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.js"),
      name: "ExamplePlugin",
      fileName: "build",
      formats: ["iife"],
    },
    outDir: resolve(__dirname, "dist/build"),
    publicDir: resolve(__dirname, "public"),
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "pkp.modules.vue",
        },
      },
    },
  },
});