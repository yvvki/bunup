import { defineConfig } from "bunup";

export default defineConfig({
    entry: ["fixtures/src/index.mts"],
    format: ["esm", "cjs"],
    target: "bun",
    dts: true,
});
