import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import Inspect from "vite-plugin-inspect"
import path from "path"

import DynamicResolve from "../plugin/index"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [Inspect(), DynamicResolve(), vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
