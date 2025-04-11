import { defineConfig } from "bunup";

export default defineConfig([
    {
        name: "bunup",
        entry: ["project/index.ts"],
        outDir: "build",
        format: ["cjs", "esm"],
        minify: true,
        dts: {
            resolve: true,
        },
        define: {
            PACKAGE_NAME: '"bunup"',
            PACKAGE_VERSION: '"1.0.0"',
        },
        splitting: false,
        target: "bun",
    },
    {
        name: "bunup-some",
        outDir: "build",
        entry: ["project/some.ts"],
        format: ["esm", "cjs"],
        minify: true,
        dts: {
            resolve: true,
        },
        define: {
            PACKAGE_NAME: '"bunup"',
            PACKAGE_VERSION: '"1.0.0"',
        },
        splitting: false,
        target: "bun",
    },
]);
