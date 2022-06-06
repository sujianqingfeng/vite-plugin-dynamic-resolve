import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import Inspect from "vite-plugin-inspect"

import DynamicResolve from "../plugin/index"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), Inspect(), DynamicResolve()],
})
