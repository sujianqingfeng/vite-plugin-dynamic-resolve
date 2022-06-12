import fs from "fs"
import path from "path"
import createDebug from "debug"
import { createFilter } from "@rollup/pluginutils"
import type { Plugin } from "vite"
import { transformSvg } from "./svg"

const debug = createDebug("vite-plugin-dynamic-resolve")

export interface Options {
  entryName?: string
  extensions?: string[]
  exclude?: RegExp[]
  replaces: string[]
  enable?: boolean
}

const exists = async (filePath: string) =>
  await fs.promises
    .access(filePath)
    .then(() => true)
    .catch((_) => false)

function PluginDynamicResolve(options: Options): Plugin {
  const {
    entryName = "index",
    extensions = [".vue", ".ts", ".module.css", ".png", ".svg"],
    exclude = [/[\\/]node_modules[\\/]/],
    replaces = [],
    enable = true,
  } = options

  const include = extensions.map((ext) => new RegExp(`${entryName}${ext}`))

  const filter = createFilter(include, exclude)
  const cssExtNames = [".css"]
  const resourceExtNames = [".png"]
  const svgExtName = ".svg"

  const isSvg = (extName: string) => svgExtName === extName
  const isResource = (extName: string) => resourceExtNames.includes(extName)

  return <Plugin>{
    name: "vite-plugin-dynamic-resolve",
    enforce: "pre",
    async transform(source, id) {
      // 关闭 保留svg
      if (!enable) {
        let extName = path.extname(id)

        if (isSvg(extName)) {
          return await transformSvg(id)
        }
        return null
      }

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

          const isExist = await exists(p)

          if (isExist) {
            debug("isExist", p)

            if (isSvg(extName)) {
              return await transformSvg(p)
            }

            if (isResource(extName)) {
              const code = source.replace(
                `${entryName}${extName}`,
                `${re}${extName}`
              )
              return code
            }

            const code = await fs.promises.readFile(p, "utf8")
            debug("code", code)
            return code
          } else {
            // 不存在 单独处理一下svg
            if (isSvg(extName)) {
              return await transformSvg(id)
            }
          }
        }
      }
      return null
    },
  }
}

export default PluginDynamicResolve
