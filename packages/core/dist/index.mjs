import fs from 'fs';
import path from 'path';
import createDebug from 'debug';
import { createFilter } from '@rollup/pluginutils';
import { optimize } from 'svgo';
import { compileTemplate } from '@vue/compiler-sfc';

createDebug("transformSvg");
async function transformSvg(path) {
  const svg = await fs.promises.readFile(path, "utf8");
  const optimizeData = optimize(svg, {
    plugins: [
      "removeUselessStrokeAndFill",
      "removeXMLNS",
      "removeViewBox",
      "removeDimensions"
    ]
  });
  if (!optimizeData.error) {
    let simpleSvg = optimizeData.data;
    simpleSvg = simpleSvg.replace("<svg", `<svg :style="{color:color,width:size+'em',height:size+'em',fill:'currentColor',overflow: 'hidden'}"`);
    const { code } = compileTemplate({
      id: JSON.stringify(path),
      source: simpleSvg,
      filename: path,
      transformAssetUrls: false
    });
    return `
          ${code}

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
          })`;
  }
}

createDebug("vite-plugin-dynamic-resolve");
const exists = async (filePath) => await fs.promises.access(filePath).then(() => true).catch((_) => false);
function PluginDynamicResolve(options) {
  const {
    entryName = "index",
    extensions = [".vue", ".ts", ".module.css", ".png", ".svg"],
    exclude = [/[\\/]node_modules[\\/]/],
    replaces = [],
    enable = true
  } = options;
  const include = extensions.map((ext) => new RegExp(`${entryName}${ext}`));
  const filter = createFilter(include, exclude);
  const cssExtNames = [".css"];
  const resourceExtNames = [".png"];
  const svgExtName = ".svg";
  const isSvg = (extName) => svgExtName === extName;
  const isResource = (extName) => resourceExtNames.includes(extName);
  return {
    name: "vite-plugin-dynamic-resolve",
    enforce: "pre",
    async load(id, options2) {
      if (id.includes("index.png")) {
        const p = id.replace("index.png", "other.png");
        const code = await this.resolve(p);
        console.log(222222, code);
        return code;
      }
    },
    async transform(source, id) {
      if (!enable) {
        let extName = path.extname(id);
        if (isSvg(extName)) {
          return await transformSvg(id);
        }
        return null;
      }
      if (filter(id)) {
        let extName = path.extname(id);
        const parentDir = path.resolve(id, "..");
        for (const re of replaces) {
          if (cssExtNames.includes(extName)) {
            extName = `.module${extName}`;
          }
          const p = `${parentDir}/${re}${extName}`;
          const isExist = await exists(p);
          if (isExist) {
            if (isSvg(extName)) {
              return await transformSvg(p);
            }
            if (isResource(extName)) {
              const code2 = source.replace(`${entryName}${extName}`, `${re}${extName}`);
              return code2;
            }
            const code = await fs.promises.readFile(p, "utf8");
            return code;
          } else {
            if (isSvg(extName)) {
              return await transformSvg(id);
            }
          }
        }
      }
      return null;
    }
  };
}

export { PluginDynamicResolve as default };
