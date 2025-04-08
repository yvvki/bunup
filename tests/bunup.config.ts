import { defineConfig } from "bunup";

export default defineConfig([
    {
        name: "bunup",
        entry: ["src/index.ts"],
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
        entry: ["src/some.ts"],
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
