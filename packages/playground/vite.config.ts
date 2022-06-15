import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import Inspect from "vite-plugin-inspect"
import DynamicResolve from "vite-plugin-dynamic-resolve"
import path from "path"

export default defineConfig({
  plugins: [
    Inspect(),
    DynamicResolve({
      enable: false,
      replaces: ["other"],
    }),
    Vue(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
