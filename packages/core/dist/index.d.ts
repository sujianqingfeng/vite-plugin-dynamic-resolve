import { Plugin } from 'vite';

interface Options {
    entryName?: string;
    extensions?: string[];
    exclude?: RegExp[];
    replaces: string[];
    enable?: boolean;
}
declare function PluginDynamicResolve(options: Options): Plugin;

export { Options, PluginDynamicResolve as default };
