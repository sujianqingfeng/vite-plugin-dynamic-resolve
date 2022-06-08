import fs from "fs"
import path from "path"
import createDebug from "debug"
import { createFilter } from "@rollup/pluginutils"
import type { Plugin } from "vite"

const debug = createDebug("vite-plugin-dynamic-resolve")

export interface Options {
  entryName?: string
  extensions?: string[]
  exclude?: RegExp[]
  replaces: string[]
}

const exists = async (filePath: string) =>
  await fs.promises
    .access(filePath)
    .then(() => true)
    .catch((_) => false)

function PluginDynamicResolve(options: Options): Plugin {
  const {
    entryName = "index",
    extensions = [".vue", ".ts", ".module.css"],
    exclude = [/[\\/]node_modules[\\/]/],
    replaces = [],
  } = options

  const include = extensions.map((ext) => new RegExp(`${entryName}${ext}`))

  const filter = createFilter(include, exclude)
  const cssExtNames = [".css"]

  return <Plugin>{
    name: "vite-plugin-dynamic-resolve",
    // enforce: "post",
    async transform(source, id) {
      if (filter(id)) {
        debug("-------------")
        debug("importer | ", id)
        debug("source | ", source)
        debug("-------------")

        let extName = path.extname(id)
        const parentDir = path.resolve(id, "..")
        // debug(parentDir, extName)

        for (const re of replaces) {
          if (cssExtNames.includes(extName)) {
            extName = `.module${extName}`
          }
          const p = `${parentDir}/${re}${extName}`
          // debug("re path", p)
          const isExist = await exists(p)
          if (isExist) {
            debug("isExist", p)
            const code = await fs.promises.readFile(p, "utf8")
            debug("code", code)
            return code
          }
        }
      }
      return null
    },
  }
}

export default PluginDynamicResolve
