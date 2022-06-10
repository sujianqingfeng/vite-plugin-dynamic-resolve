import fs from "fs"
import path from "path"
import createDebug from "debug"
import { createFilter } from "@rollup/pluginutils"
import type { Plugin } from "vite"
import { optimize as optimizeSvg, OptimizedSvg } from "svgo"
import { compileTemplate, parse } from "@vue/compiler-sfc"

import { template } from "./template"

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
    extensions = [".vue", ".ts", ".module.css", ".png", ".svg"],
    exclude = [/[\\/]node_modules[\\/]/],
    replaces = [],
  } = options

  const include = extensions.map((ext) => new RegExp(`${entryName}${ext}`))

  const filter = createFilter(include, exclude)
  const cssExtNames = [".css"]
  const resourceExtNames = [".png"]
  const svgExtName = ".svg"

  return <Plugin>{
    name: "vite-plugin-dynamic-resolve",
    enforce: "pre",
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

            if (svgExtName === extName) {
              const svg = await fs.promises.readFile(id, "utf8")

              const optimizeData = optimizeSvg(svg, {
                plugins: [
                  "removeUselessStrokeAndFill",
                  "removeXMLNS",
                  "removeViewBox",
                  "removeDimensions",
                ],
              })
              if (!optimizeData.error) {
                debug(1111111, optimizeData)
                const simpleSvg = (optimizeData as OptimizedSvg).data

                const removeSvgTag = /<svg.+?>(.+)<\/svg>/.exec(simpleSvg)

                debug(4444, removeSvgTag)

                if (removeSvgTag && removeSvgTag.length > 1) {
                  const component = template.replace("###", simpleSvg)
                  const ddd = parse(component)
                  debug(555, ddd)

                  const { code } = compileTemplate({
                    id: JSON.stringify(id),
                    source: component,
                    filename: id,
                    transformAssetUrls: false,
                  })
                  debug(3333, code)

                  return `${code}\nexport default { render: render }`
                }
              }

              return source
            }

            if (resourceExtNames.includes(extName)) {
              const code = source.replace(
                `${entryName}${extName}`,
                `${re}${extName}`
              )
              return code
            }

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
