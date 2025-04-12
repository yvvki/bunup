import { readFileSync } from "node:fs";

export function loadConfig(path: string): {
    publicPath: string;
} {
    return JSON.parse(readFileSync(path, "utf-8"));
}
