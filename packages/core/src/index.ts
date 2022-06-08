import fs from "fs"
import path from "path"
import createDebug from "debug"
import { createFilter } from "@rollup/pluginutils"
import type { Plugin } from "vite"

const debug = createDebug("vite-plugin-dynamic-resolve")

interface Options {}

const exists = async (filePath: string) =>
  await fs.promises
    .access(filePath)
    .then(() => true)
    .catch((_) => false)

function PluginDynamicResolve(): Plugin {
  const entryName = "index"
  const extensions = [".vue", ".ts"]

  const include = extensions.map((ext) => new RegExp(`${entryName}${ext}`))
  const exclude = [/[\\/]node_modules[\\/]/]

  const replaces = ["other"]

  const filter = createFilter(include, exclude)

  return <Plugin>{
    name: "vite-plugin-dynamic-resolve",
    // enforce: "post",
    async transform(source, id) {
      if (filter(id)) {
        debug("-------------")
        debug("importer | ", id)
        debug("source | ", source)
        debug("-------------")

        const extName = path.extname(id)
        const parentDir = path.resolve(id, "..")
        debug(parentDir, extName)

        for (const re of replaces) {
          const p = `${parentDir}/${re}${extName}`
          debug("re path", p)
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
