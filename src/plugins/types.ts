import type { BunPlugin } from "../types";

export type Plugin<T extends "bun" = "bun"> = {
    type: T;
    plugin: T extends "bun" ? BunPlugin : never;
};
