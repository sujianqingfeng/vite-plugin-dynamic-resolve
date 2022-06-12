import fs from "fs"
import { optimize as optimizeSvg, OptimizedSvg } from "svgo"
import createDebug from "debug"
import { compileTemplate } from "@vue/compiler-sfc"

const debug = createDebug("transformSvg")

export async function transformSvg(path: string) {
  const svg = await fs.promises.readFile(path, "utf8")

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
    let simpleSvg = (optimizeData as OptimizedSvg).data

    simpleSvg = simpleSvg.replace(
      "<svg",
      `<svg :style="{color:color,width:size+'em',height:size+'em',fill:'currentColor',overflow: 'hidden'}"`
    )

    const { code } = compileTemplate({
      id: JSON.stringify(path),
      source: simpleSvg,
      filename: path,
      transformAssetUrls: false,
    })
    debug(3333, code)

    return `
          ${code}\n
          import { defineComponent, h } from "vue"

          export default defineComponent({
            name: "test",
            props: {
              color: {
                type: String,
                default: "red",
              },
              size:{
                type:String,
                default:"1"
              }
            },
            render,
          })`
  }
}
