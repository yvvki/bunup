import { beforeEach, describe, expect, it } from "vitest";
import {
    cleanProjectDir,
    createProject,
    findFile,
    runBuild,
    runDtsBuild,
    validateBuildFiles,
} from "./utils";

describe("Build Process", () => {
    beforeEach(() => {
        cleanProjectDir();
        createProject({ "src/index.ts": "export const x = 1;" });
    });

    it("builds single entry", async () => {
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
        });
        expect(
            validateBuildFiles(result, {
                expectedFiles: ["index.mjs"],
            }),
        ).toBe(true);
    });

    it("builds multiple entries", async () => {
        createProject({ "src/index.ts": "", "src/utils.ts": "" });
        const result = await runBuild({
            entry: ["src/index.ts", "src/utils.ts"],
            format: ["esm"],
        });
        expect(
            validateBuildFiles(result, {
                expectedFiles: ["index.mjs", "utils.mjs"],
            }),
        ).toBe(true);
    });

    it("builds named entries", async () => {
        const result = await runBuild({
            entry: { main: "src/index.ts" },
            format: ["esm"],
        });
        expect(
            validateBuildFiles(result, {
                expectedFiles: ["main.mjs"],
            }),
        ).toBe(true);
    });

    it("handles multiple formats", async () => {
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm", "cjs", "iife"],
        });
        expect(
            validateBuildFiles(result, {
                expectedFiles: ["index.mjs", "index.js", "index.global.js"],
            }),
        ).toBe(true);
    });

    it("generates DTS when enabled", async () => {
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            dts: true,
        });
        expect(
            validateBuildFiles(result, {
                expectedFiles: ["index.mjs", "index.d.mts"],
            }),
        ).toBe(true);
    });

    it("respects minify options", async () => {
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            minify: true,
        });
        expect(result.files[0].size).toBeLessThan(50);
    });

    it("handles package type module", async () => {
        createProject({
            "src/index.ts": "export const x = 1;",
            "package.json": `{"type": "module"}`,
        });
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["cjs"],
            dts: true,
        });
        expect(
            validateBuildFiles(result, {
                expectedFiles: ["index.cjs", "index.d.cts"],
            }),
        ).toBe(true);
    });

    it("includes banner/footer", async () => {
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            banner: "// Banner",
            footer: "// Footer",
        });
        const file = result.files[0];
        expect(file.content).toContain("// Banner");
        expect(file.content).toContain("// Footer");
    });

    it("respects external", async () => {
        createProject({ "src/index.ts": `import 'chalk';` });
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            external: ["chalk"],
        });
        expect(result.files[0].content).toContain("chalk");
    });

    it("should clean the output directory before building when the clean option is true", async () => {
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(
            validateBuildFiles(result, {
                expectedFiles: ["index.mjs"],
            }),
        ).toBe(true);

        const result2 = await runBuild({
            entry: "src/index.ts",
            format: ["cjs"],
            clean: true,
        });

        expect(result2.success).toBe(true);
        expect(result2.files.length).toBe(1);

        expect(
            validateBuildFiles(result2, {
                expectedFiles: ["index.js"],
            }),
        ).toBe(true);
    });

    it("should not clean the output directory when the clean option is false", async () => {
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            clean: false,
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(
            validateBuildFiles(result, {
                expectedFiles: ["index.mjs"],
            }),
        ).toBe(true);

        const result2 = await runBuild({
            entry: "src/index.ts",
            format: ["cjs"],
            clean: false,
        });

        expect(result2.success).toBe(true);
        expect(result2.files.length).toBe(2);

        expect(
            validateBuildFiles(result2, {
                expectedFiles: ["index.js", "index.mjs"],
            }),
        ).toBe(true);
    });

    it("should generate only DTS files when dtsOnly is enabled", async () => {
        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm", "cjs"],
            dtsOnly: true,
        });

        expect(result.success).toBe(true);

        expect(
            validateBuildFiles(result, {
                expectedFiles: ["index.d.mts", "index.d.ts"],
                notExpectedFiles: ["index.js", "index.mjs", "index.cjs"],
            }),
        ).toBe(true);
    });

    it("should handle named entries with dtsOnly option", async () => {
        const result = await runBuild({
            entry: { main: "src/index.ts" },
            format: ["esm", "cjs"],
            dtsOnly: true,
        });

        expect(result.success).toBe(true);
        expect(
            validateBuildFiles(result, {
                expectedFiles: ["main.d.mts", "main.d.ts"],
                notExpectedFiles: ["main.js", "main.mjs", "main.cjs"],
            }),
        ).toBe(true);
    });

    it("should respect custom dts entry points when using dtsOnly", async () => {
        createProject({
            "src/index.ts": "export const x = 1;",
            "src/utils.ts": "export const util = () => 'utility';",
        });

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            dtsOnly: true,
            dts: {
                entry: "src/utils.ts",
            },
        });

        expect(result.success).toBe(true);
        expect(
            validateBuildFiles(result, {
                expectedFiles: ["utils.d.mts"],
                notExpectedFiles: ["utils.d.ts"],
            }),
        ).toBe(true);
    });
});
