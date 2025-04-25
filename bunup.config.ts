import { type DefineConfigItem, defineWorkspace } from "bunup";
import { report } from "bunup/plugins";

const COMMON_OPTIONS: Partial<DefineConfigItem> = {
    outDir: "dist",
    minify: true,
    splitting: false,
    target: "bun",
    plugins: [report()],
};

export default defineWorkspace([
    {
        name: "bunup",
        root: "packages/bunup",
        config: [
            {
                ...COMMON_OPTIONS,
                entry: ["src/index.ts"],
                format: ["cjs", "esm"],
                dts: true,
            },
            {
                ...COMMON_OPTIONS,
                entry: ["src/cli.ts"],
                format: ["esm"],
            },
            {
                ...COMMON_OPTIONS,
                entry: { plugins: "src/plugins/built-in/index.ts" },
                format: ["esm", "cjs"],
                dts: true,
            },
        ],
    },
    {
        name: "create-bunup",
        root: "packages/create-bunup",
        config: [
            {
                ...COMMON_OPTIONS,
                entry: ["src/index.ts"],
                format: ["esm"],
            },
        ],
    },
]);
