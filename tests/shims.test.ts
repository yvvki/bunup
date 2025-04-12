import { beforeEach, describe, expect, it } from "vitest";
import { cleanProjectDir, createProject, findFile, runBuild } from "./utils";

describe("Shims", () => {
    beforeEach(() => {
        cleanProjectDir();
    });

    it("should add __dirname and __filename shims in ESM format when used and enabled", async () => {
        createProject({
            "src/index.ts": `
                console.log("dirname:", __dirname);
                console.log("filename:", __filename);
                export const path = __dirname + '/' + __filename;
            `,
        });

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            shims: true,
        });

        expect(result.success).toBe(true);
        const esmFile = findFile(result, "index", ".mjs");
        expect(esmFile).toBeDefined();
        expect(esmFile?.content).toContain("__filename");
        expect(esmFile?.content).toContain("__dirname");
    });

    it("should add only __dirname shim when only it is used and both are enabled", async () => {
        createProject({
            "src/index.ts": `
                    console.log("dirname:", __dirname);
                    export const dir = __dirname;
                `,
        });

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            shims: true,
        });

        expect(result.success).toBe(true);
        const esmFile = findFile(result, "index", ".mjs");
        expect(esmFile).toBeDefined();
        expect(esmFile?.content).toContain("__dirname");
        expect(esmFile?.content).not.toContain("__filename");
    });

    it("should add only __filename shim when only it is used and both are enabled", async () => {
        createProject({
            "src/index.ts": `
                    console.log("filename:", __filename);
                    export const file = __filename;
                `,
        });

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            shims: true,
        });

        expect(result.success).toBe(true);
        const esmFile = findFile(result, "index", ".mjs");
        expect(esmFile).toBeDefined();
        expect(esmFile?.content).toContain("__filename");
        expect(esmFile?.content).not.toContain("__dirname");
    });

    it("should not add shims when they are not used even if enabled", async () => {
        createProject({
            "src/index.ts": `
                    console.log("Hello world");
                    export const greeting = "Hello world";
                `,
        });

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            shims: true,
        });

        expect(result.success).toBe(true);
        const esmFile = findFile(result, "index", ".mjs");
        expect(esmFile).toBeDefined();
        expect(esmFile?.content).not.toContain("__filename");
        expect(esmFile?.content).not.toContain("__dirname");
    });

    // it("should add import.meta.url shim in CJS format when used and enabled", async () => {
    //     createProject({
    //         "src/index.ts": `
    //                 console.log("url:", import.meta.url);
    //                 export const url = import.meta.url;
    //             `,
    //     });

    //     const result = await runBuild({
    //         entry: "src/index.ts",
    //         format: ["cjs"],
    //         shims: true,
    //     });

    //     expect(result.success).toBe(true);
    //     const cjsFile = findFile(result, "index", ".js");
    //     expect(cjsFile).toBeDefined();
    //     expect(cjsFile?.content).toContain("pathToFileURL(__filename).href");
    // });

    //     it("should not add import.meta.url shim in CJS when it is not used even if enabled", async () => {
    //         createProject({
    //             "src/index.ts": `
    //                 console.log("Hello world");
    //                 export const greeting = "Hello world";
    //             `,
    //         });

    //         const result = await runBuild({
    //             entry: "src/index.ts",
    //             format: ["cjs"],
    //             shims: true,
    //         });

    //         expect(result.success).toBe(true);
    //         const cjsFile = findFile(result, "index", ".js");
    //         expect(cjsFile).toBeDefined();
    //         expect(cjsFile?.content).not.toContain(
    //             "import { pathToFileURL } from 'url'",
    //         );
    //         expect(cjsFile?.content).not.toContain(
    //             "const importMetaUrl = pathToFileURL(__filename).href",
    //         );
    //     });

    //     it("should not add import.meta.url shim in CJS when used but disabled", async () => {
    //         createProject({
    //             "src/index.ts": `
    //                 console.log("url:", import.meta.url);
    //                 export const url = import.meta.url;
    //             `,
    //         });

    //         const result = await runBuild({
    //             entry: "src/index.ts",
    //             format: ["cjs"],
    //             shims: { importMetaUrl: false },
    //         });

    //         expect(result.success).toBe(true);
    //         const cjsFile = findFile(result, "index", ".js");
    //         expect(cjsFile).toBeDefined();
    //         expect(cjsFile?.content).not.toContain(
    //             "import { pathToFileURL } from 'url'",
    //         );
    //         expect(cjsFile?.content).not.toContain(
    //             "const importMetaUrl = pathToFileURL(__filename).href",
    //         );
    //     });

    //     it("should respect selective shim configuration for ESM format", async () => {
    //         createProject({
    //             "src/index.ts": `
    //                 console.log("dirname:", __dirname);
    //                 console.log("filename:", __filename);
    //                 export const path = __dirname + '/' + __filename;
    //             `,
    //         });

    //         const result = await runBuild({
    //             entry: "src/index.ts",
    //             format: ["esm"],
    //             shims: { dirname: true, filename: false },
    //         });

    //         expect(result.success).toBe(true);
    //         const esmFile = findFile(result, "index", ".mjs");
    //         expect(esmFile).toBeDefined();
    //         expect(esmFile?.content).toContain(
    //             "import { fileURLToPath } from 'url'",
    //         );
    //         expect(esmFile?.content).toContain("import { dirname } from 'path'");
    //         expect(esmFile?.content).toContain(
    //             "const __dirname = dirname(fileURLToPath(import.meta.url))",
    //         );
    //         expect(esmFile?.content).not.toContain(
    //             "const __filename = fileURLToPath(import.meta.url)",
    //         );
    //     });

    //     it("should respect selective shim configuration for CJS format", async () => {
    //         createProject({
    //             "src/index.ts": `
    //                 console.log("url:", import.meta.url);
    //                 export const url = import.meta.url;
    //             `,
    //         });

    //         const result = await runBuild({
    //             entry: "src/index.ts",
    //             format: ["cjs"],
    //             shims: { importMetaUrl: true },
    //         });

    //         expect(result.success).toBe(true);
    //         const cjsFile = findFile(result, "index", ".js");
    //         expect(cjsFile).toBeDefined();
    //         expect(cjsFile?.content).toContain(
    //             "import { pathToFileURL } from 'url'",
    //         );
    //         expect(cjsFile?.content).toContain(
    //             "const importMetaUrl = pathToFileURL(__filename).href",
    //         );
    //     });

    //     it("should handle shebang correctly when adding shims", async () => {
    //         createProject({
    //             "src/cli.ts": `#!/usr/bin/env node
    //                 console.log("dirname:", __dirname);
    //                 console.log("filename:", __filename);
    //                 export const path = __dirname + '/' + __filename;
    //             `,
    //         });

    //         const result = await runBuild({
    //             entry: "src/cli.ts",
    //             format: ["esm"],
    //             shims: true,
    //         });

    //         expect(result.success).toBe(true);
    //         const esmFile = findFile(result, "cli", ".mjs");
    //         expect(esmFile).toBeDefined();
    //         expect(esmFile?.content).toMatch(/^#!\/usr\/bin\/env node/);
    //         expect(esmFile?.content).toContain(
    //             "import { fileURLToPath } from 'url'",
    //         );
    //         expect(esmFile?.content).toContain("import { dirname } from 'path'");
    //         expect(esmFile?.content).toContain(
    //             "const __filename = fileURLToPath(import.meta.url)",
    //         );
    //         expect(esmFile?.content).toContain(
    //             "const __dirname = dirname(__filename)",
    //         );
    //     });

    //     it("should not add shims in IIFE format regardless of configuration", async () => {
    //         createProject({
    //             "src/index.ts": `
    //                 console.log("dirname:", __dirname);
    //                 console.log("filename:", __filename);
    //                 console.log("url:", import.meta.url);
    //                 export const path = __dirname + '/' + __filename;
    //                 export const url = import.meta.url;
    //             `,
    //         });

    //         const result = await runBuild({
    //             entry: "src/index.ts",
    //             format: ["iife"],
    //             shims: true,
    //         });

    //         expect(result.success).toBe(true);
    //         const iifeFile = findFile(result, "index", ".global.js");
    //         expect(iifeFile).toBeDefined();
    //         expect(iifeFile?.content).not.toContain(
    //             "import { fileURLToPath } from 'url'",
    //         );
    //         expect(iifeFile?.content).not.toContain(
    //             "import { dirname } from 'path'",
    //         );
    //         expect(iifeFile?.content).not.toContain(
    //             "const __filename = fileURLToPath(import.meta.url)",
    //         );
    //         expect(iifeFile?.content).not.toContain(
    //             "const __dirname = dirname(__filename)",
    //         );
    //         expect(iifeFile?.content).not.toContain(
    //             "import { pathToFileURL } from 'url'",
    //         );
    //         expect(iifeFile?.content).not.toContain(
    //             "const importMetaUrl = pathToFileURL(__filename).href",
    //         );
    //     });

    //     it("should not add shims when target is not Node compatible", async () => {
    //         createProject({
    //             "src/index.ts": `
    //                 console.log("dirname:", __dirname);
    //                 console.log("filename:", __filename);
    //                 export const path = __dirname + '/' + __filename;
    //             `,
    //         });

    //         const result = await runBuild({
    //             entry: "src/index.ts",
    //             format: ["esm"],
    //             target: "browser",
    //             shims: true,
    //         });

    //         expect(result.success).toBe(true);
    //         const esmFile = findFile(result, "index", ".mjs");
    //         expect(esmFile).toBeDefined();
    //         expect(esmFile?.content).not.toContain(
    //             "import { fileURLToPath } from 'url'",
    //         );
    //         expect(esmFile?.content).not.toContain(
    //             "import { dirname } from 'path'",
    //         );
    //         expect(esmFile?.content).not.toContain(
    //             "const __filename = fileURLToPath(import.meta.url)",
    //         );
    //         expect(esmFile?.content).not.toContain(
    //             "const __dirname = dirname(__filename)",
    //         );
    //     });

    //     it("should properly handle multiple entry points with shims", async () => {
    //         createProject({
    //             "src/index.ts": `
    //                 console.log("dirname:", __dirname);
    //                 export const dir = __dirname;
    //             `,
    //             "src/utils.ts": `
    //                 console.log("filename:", __filename);
    //                 export const file = __filename;
    //             `,
    //         });

    //         const result = await runBuild({
    //             entry: ["src/index.ts", "src/utils.ts"],
    //             format: ["esm"],
    //             shims: true,
    //         });

    //         expect(result.success).toBe(true);

    //         const indexFile = findFile(result, "index", ".mjs");
    //         expect(indexFile).toBeDefined();
    //         expect(indexFile?.content).toContain(
    //             "import { fileURLToPath } from 'url'",
    //         );
    //         expect(indexFile?.content).toContain("import { dirname } from 'path'");
    //         expect(indexFile?.content).toContain(
    //             "const __dirname = dirname(fileURLToPath(import.meta.url))",
    //         );
    //         expect(indexFile?.content).not.toContain(
    //             "const __filename = fileURLToPath(import.meta.url)",
    //         );

    //         const utilsFile = findFile(result, "utils", ".mjs");
    //         expect(utilsFile).toBeDefined();
    //         expect(utilsFile?.content).toContain(
    //             "import { fileURLToPath } from 'url'",
    //         );
    //         expect(utilsFile?.content).toContain("import { dirname } from 'path'");
    //         expect(utilsFile?.content).toContain(
    //             "const __filename = fileURLToPath(import.meta.url)",
    //         );
    //         expect(utilsFile?.content).not.toContain(
    //             "const __dirname = dirname(fileURLToPath(import.meta.url))",
    //         );
    //     });
});
