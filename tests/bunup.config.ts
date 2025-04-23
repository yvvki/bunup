import { defineWorkspace } from "../dist/index.mjs";

export default defineWorkspace([
    {
        name: "client",
        root: "fixtures/client",
        config: {
            entry: ["index.ts"],
            format: ["esm", "cjs"],
            dts: true,
        },
    },
    {
        name: "server",
        root: "fixtures/server",
        config: {
            entry: ["index.ts"],
            format: ["esm", "cjs"],
            outDir: "dist/server",
            dts: true,
        },
    },
]);
