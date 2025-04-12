/// <reference path="./types.d.ts" />

import { readFileSync } from "node:fs";

export function loadConfig(path: string): Config {
    return JSON.parse(readFileSync(path, "utf-8"));
}
