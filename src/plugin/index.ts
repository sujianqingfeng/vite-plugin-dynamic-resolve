import type { Plugin } from "vite"

function PluginDynamicResolve(): Plugin {
  return <Plugin>{
    name: "vite-plugin-dynamic-resolve",
    enforce: "pre",
    resolveId(id) {
      console.log("resolveId", id)

      return id
    },
  }
}

export default PluginDynamicResolve
