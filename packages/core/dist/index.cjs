'use strict';

const fs = require('fs');
const path = require('path');
const createDebug = require('debug');
const pluginutils = require('@rollup/pluginutils');
const svgo = require('svgo');
const compilerSfc = require('@vue/compiler-sfc');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

const fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
const path__default = /*#__PURE__*/_interopDefaultLegacy(path);
const createDebug__default = /*#__PURE__*/_interopDefaultLegacy(createDebug);

const debug$1 = createDebug__default("transformSvg");
async function transformSvg(path) {
  const svg = await fs__default.promises.readFile(path, "utf8");
  const optimizeData = svgo.optimize(svg, {
    plugins: [
      "removeUselessStrokeAndFill",
      "removeXMLNS",
      "removeViewBox",
      "removeDimensions"
    ]
  });
  if (!optimizeData.error) {
    debug$1(1111111, optimizeData);
    let simpleSvg = optimizeData.data;
    simpleSvg = simpleSvg.replace("<svg", `<svg :style="{color:color,width:size+'em',height:size+'em',fill:'currentColor',overflow: 'hidden'}"`);
    const { code } = compilerSfc.compileTemplate({
      id: JSON.stringify(path),
      source: simpleSvg,
      filename: path,
      transformAssetUrls: false
    });
    debug$1(3333, code);
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

const debug = createDebug__default("vite-plugin-dynamic-resolve");
const exists = async (filePath) => await fs__default.promises.access(filePath).then(() => true).catch((_) => false);
function PluginDynamicResolve(options) {
  const {
    entryName = "index",
    extensions = [".vue", ".ts", ".module.css", ".png", ".svg"],
    exclude = [/[\\/]node_modules[\\/]/],
    replaces = [],
    enable = true
  } = options;
  const include = extensions.map((ext) => new RegExp(`${entryName}${ext}`));
  const filter = pluginutils.createFilter(include, exclude);
  const cssExtNames = [".css"];
  const resourceExtNames = [".png"];
  const svgExtName = ".svg";
  const isSvg = (extName) => svgExtName === extName;
  const isResource = (extName) => resourceExtNames.includes(extName);
  return {
    name: "vite-plugin-dynamic-resolve",
    enforce: "pre",
    async transform(source, id) {
      if (!enable) {
        let extName = path__default.extname(id);
        if (isSvg(extName)) {
          return await transformSvg(id);
        }
        return null;
      }
      if (filter(id)) {
        debug("-------------");
        debug("importer | ", id);
        debug("source | ", source);
        debug("-------------");
        let extName = path__default.extname(id);
        const parentDir = path__default.resolve(id, "..");
        for (const re of replaces) {
          if (cssExtNames.includes(extName)) {
            extName = `.module${extName}`;
          }
          const p = `${parentDir}/${re}${extName}`;
          const isExist = await exists(p);
          if (isExist) {
            debug("isExist", p);
            if (isSvg(extName)) {
              return await transformSvg(p);
            }
            if (isResource(extName)) {
              const code2 = source.replace(`${entryName}${extName}`, `${re}${extName}`);
              return code2;
            }
            const code = await fs__default.promises.readFile(p, "utf8");
            debug("code", code);
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

module.exports = PluginDynamicResolve;
