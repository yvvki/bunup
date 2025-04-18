import type { BunPlugin } from "../types";
import type { Plugin } from "./types";

export function filterBunPlugins(plugins: Plugin[]): BunPlugin[] {
    return plugins.filter((p) => p.type === "bun").map((p) => p.plugin);
}
