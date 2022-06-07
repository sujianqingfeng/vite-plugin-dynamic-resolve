import type { Plugin } from "vite"

interface Options {}

function PluginDynamicResolve(): Plugin {
  return <Plugin>{
    name: "vite-plugin-dynamic-resolve",
    enforce: "post",
    transform(source, importer, options) {
      const isThird = /node_modules/.test(importer)
      const isVue = /\.vue$/.test(importer)
      if (!isThird) {
        if (isVue) {
          // console.log("transform", source, "----", importer)
          source = source.replace(/\/index\.vue/, "/other.vue")
          // console.log("transform", source, "----", importer)
          return source
        }
      }
      return null
    },
  }
}

export default PluginDynamicResolve
