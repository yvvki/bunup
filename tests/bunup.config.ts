import { defineConfig } from "../dist/index.mjs";

export default defineConfig({
    entry: [
        "fixtures/index.ts",
        "fixtures/client/index.ts",
        "fixtures/server/index.ts",
    ],
    format: ["esm", "cjs"],
    dts: true,
});
