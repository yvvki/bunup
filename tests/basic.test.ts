import { beforeEach, describe, expect, it } from "vitest";
import {
    cleanProjectDir,
    createProject,
    findFile,
    runBuild,
    validateBuildFiles,
} from "./utils";

describe("bunup basic build", () => {
    beforeEach(() => {
        cleanProjectDir();
    });

    it("should build with ESM format", async () => {
        createProject({
            "index.ts": `export const result = "Hello, world!";`,
        });

        const result = await runBuild({
            entry: "index.ts",
            format: ["esm"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(validateBuildFiles(result, ["index.mjs"])).toBe(true);
    });

    it("should build with CJS format", async () => {
        createProject({
            "index.ts": `export const result = "Hello, world!";`,
        });

        const result = await runBuild({
            entry: "index.ts",
            format: ["cjs"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(validateBuildFiles(result, ["index.js"])).toBe(true);
    });

    it("should build with default format", async () => {
        createProject({
            "index.ts": `export const result = "Hello, world!";`,
        });

        const result = await runBuild({
            entry: "index.ts",
            format: ["iife"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(validateBuildFiles(result, ["index.global.js"])).toBe(true);
    });

    it("should build with multiple formats simultaneously", async () => {
        createProject({
            "index.ts": `export const result = "Hello, world!";`,
        });

        const result = await runBuild({
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
        expect(esmFile?.content).toMatchSnapshot();

        const cjsFile = findFile(result, "index", ".js");
        expect(cjsFile?.content).toMatchSnapshot();

        const iifeFile = findFile(result, "index", ".global.js");
        expect(iifeFile?.content).toMatchSnapshot();
    });

    it("should output .cjs file when package.json type is module", async () => {
        createProject({
            "index.ts": `export const result = "Hello, world!";`,
            "package.json": `{
                "name": "test",
                "version": "1.0.0",
                "type": "module"
            }`,
        });

        const result = await runBuild({
            entry: "index.ts",
            format: ["cjs"],
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);

        expect(validateBuildFiles(result, ["index.cjs"])).toBe(true);
    });
});
