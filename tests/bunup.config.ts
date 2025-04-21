import { defineConfig } from "../dist/index.mjs";

export default defineConfig({
    entry: ["fixtures/index.ts"],
    format: ["esm", "cjs"],
    target: "bun",
    dts: true,
});
