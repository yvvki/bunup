import { describe, expect, it } from "bun:test";
import { INDEX_CONTENT } from "./constants";
import { findFile, mutateFile, run, validateBuildFiles } from "./utils";

describe("bunup basic build", () => {
    it("should build with ESM format", async () => {
        const result = await run({
            entry: "index.ts",
            format: ["esm"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(validateBuildFiles(result, ["index.mjs"])).toBe(true);

        const file = findFile(result, "index", ".mjs");
        expect(file).toBeDefined();
        expect(file?.content).toContain(INDEX_CONTENT);
    });

    it("should build with CJS format", async () => {
        const result = await run({
            entry: "index.ts",
            format: ["cjs"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(validateBuildFiles(result, ["index.js"])).toBe(true);

        const file = findFile(result, "index", ".js");
        expect(file).toBeDefined();
        expect(file?.content).toContain(INDEX_CONTENT);
    });

    it("should build with default format", async () => {
        const result = await run({
            entry: "index.ts",
            format: ["iife"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(validateBuildFiles(result, ["index.global.js"])).toBe(true);

        const file = findFile(result, "index", ".global.js");
        expect(file).toBeDefined();
        expect(file?.content).toContain(INDEX_CONTENT);
    });

    it("should build with multiple formats simultaneously", async () => {
        const result = await run({
            entry: "index.ts",
            format: ["esm", "cjs", "iife"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(3);

        expect(
            validateBuildFiles(result, [
                "index.mjs",
                "index.js",
                "index.global.js",
            ]),
        ).toBe(true);

        const esmFile = findFile(result, "index", ".mjs");
        expect(esmFile).toBeDefined();
        expect(esmFile?.content).toContain(INDEX_CONTENT);

        const cjsFile = findFile(result, "index", ".js");
        expect(cjsFile).toBeDefined();
        expect(cjsFile?.content).toContain(INDEX_CONTENT);

        const iifeFile = findFile(result, "index", ".global.js");
        expect(iifeFile).toBeDefined();
        expect(iifeFile?.content).toContain(INDEX_CONTENT);
    });

    it("should output .cjs file when package.json type is module", async () => {
        const restorePackageJson = mutateFile("package.json", (content) => {
            const packageJson = JSON.parse(content);
            packageJson.type = "module";
            return JSON.stringify(packageJson, null, 2);
        });

        const result = await run({
            entry: "index.ts",
            format: ["cjs"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(validateBuildFiles(result, ["index.cjs"])).toBe(true);

        const file = findFile(result, "index", ".cjs");
        expect(file).toBeDefined();
        expect(file?.content).toContain(INDEX_CONTENT);

        restorePackageJson();
    });
});
