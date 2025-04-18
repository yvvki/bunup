import { describe, expect, it } from "vitest";
import {
    addDtsVirtualPrefix,
    getDtsPath,
    isDtsFile,
    isDtsVirtualFile,
    isSourceCodeFile,
    removeDtsVirtualPrefix,
} from "../src/dts/utils";
import { DTS_VIRTUAL_FILE_PREFIX } from "../src/dts/virtual-files";

describe("DTS Utils", () => {
    describe("getDtsPath", () => {
        it("converts .ts to .d.ts", () => {
            expect(getDtsPath("/path/to/file.ts")).toBe("/path/to/file.d.ts");
        });

        it("converts .tsx to .d.ts", () => {
            expect(getDtsPath("/path/to/component.tsx")).toBe(
                "/path/to/component.d.ts",
            );
        });

        it("converts .mts to .d.ts", () => {
            expect(getDtsPath("/path/to/module.mts")).toBe(
                "/path/to/module.d.ts",
            );
        });

        it("converts .cts to .d.ts", () => {
            expect(getDtsPath("/path/to/commonjs.cts")).toBe(
                "/path/to/commonjs.d.ts",
            );
        });

        it("converts .js to .d.ts", () => {
            expect(getDtsPath("/path/to/file.js")).toBe("/path/to/file.d.ts");
        });

        it("converts .jsx to .d.ts", () => {
            expect(getDtsPath("/path/to/component.jsx")).toBe(
                "/path/to/component.d.ts",
            );
        });

        it("converts .mjs to .d.ts", () => {
            expect(getDtsPath("/path/to/module.mjs")).toBe(
                "/path/to/module.d.ts",
            );
        });

        it("converts .cjs to .d.ts", () => {
            expect(getDtsPath("/path/to/commonjs.cjs")).toBe(
                "/path/to/commonjs.d.ts",
            );
        });

        it("handles paths with multiple dots", () => {
            expect(getDtsPath("/path/to/file.spec.ts")).toBe(
                "/path/to/file.spec.d.ts",
            );
        });

        it("handles paths with no extension (leaves unchanged)", () => {
            expect(getDtsPath("/path/to/file")).toBe("/path/to/file");
        });

        it("handles empty string", () => {
            expect(getDtsPath("")).toBe("");
        });

        it("does not convert .d.ts files", () => {
            expect(getDtsPath("/path/to/file.d.ts")).toBe("/path/to/file.d.ts");
        });

        it("does not convert .d.mts files", () => {
            expect(getDtsPath("/path/to/file.d.mts")).toBe(
                "/path/to/file.d.mts",
            );
        });

        it("does not convert .d.cts files", () => {
            expect(getDtsPath("/path/to/file.d.cts")).toBe(
                "/path/to/file.d.cts",
            );
        });
    });

    describe("isSourceCodeFile", () => {
        it("returns true for TypeScript files", () => {
            expect(isSourceCodeFile("/path/to/file.ts")).toBe(true);
            expect(isSourceCodeFile("/path/to/component.tsx")).toBe(true);
            expect(isSourceCodeFile("/path/to/module.mts")).toBe(true);
            expect(isSourceCodeFile("/path/to/commonjs.cts")).toBe(true);
        });

        it("returns true for JavaScript files", () => {
            expect(isSourceCodeFile("/path/to/file.js")).toBe(true);
            expect(isSourceCodeFile("/path/to/component.jsx")).toBe(true);
            expect(isSourceCodeFile("/path/to/module.mjs")).toBe(true);
            expect(isSourceCodeFile("/path/to/commonjs.cjs")).toBe(true);
        });

        it("returns false for non-source code files", () => {
            expect(isSourceCodeFile("/path/to/file.json")).toBe(false);
            expect(isSourceCodeFile("/path/to/image.png")).toBe(false);
            expect(isSourceCodeFile("/path/to/style.css")).toBe(false);
            expect(isSourceCodeFile("/path/to/file.d.ts")).toBe(false);
        });

        it("handles paths with multiple dots", () => {
            expect(isSourceCodeFile("/path/to/file.spec.ts")).toBe(true);
            expect(isSourceCodeFile("/path/to/component.test.tsx")).toBe(true);
            expect(isSourceCodeFile("/path/to/module.min.js")).toBe(true);
        });

        it("handles paths with no extension", () => {
            expect(isSourceCodeFile("/path/to/file")).toBe(false);
        });

        it("handles empty string", () => {
            expect(isSourceCodeFile("")).toBe(false);
        });
    });

    describe("isDtsFile", () => {
        it("returns true for .d.ts files", () => {
            expect(isDtsFile("/path/to/file.d.ts")).toBe(true);
        });

        it("returns true for .d.mts files", () => {
            expect(isDtsFile("/path/to/file.d.mts")).toBe(true);
        });

        it("returns true for .d.cts files", () => {
            expect(isDtsFile("/path/to/file.d.cts")).toBe(true);
        });

        it("returns false for regular TypeScript files", () => {
            expect(isDtsFile("/path/to/file.ts")).toBe(false);
            expect(isDtsFile("/path/to/component.tsx")).toBe(false);
            expect(isDtsFile("/path/to/module.mts")).toBe(false);
            expect(isDtsFile("/path/to/commonjs.cts")).toBe(false);
        });

        it("returns false for JavaScript files", () => {
            expect(isDtsFile("/path/to/file.js")).toBe(false);
            expect(isDtsFile("/path/to/component.jsx")).toBe(false);
            expect(isDtsFile("/path/to/module.mjs")).toBe(false);
            expect(isDtsFile("/path/to/commonjs.cjs")).toBe(false);
        });

        it("returns false for other file types", () => {
            expect(isDtsFile("/path/to/file.json")).toBe(false);
            expect(isDtsFile("/path/to/image.png")).toBe(false);
        });

        it("handles paths with multiple dots", () => {
            expect(isDtsFile("/path/to/file.spec.d.ts")).toBe(true);
            expect(isDtsFile("/path/to/file.test.d.mts")).toBe(true);
        });

        it("handles paths with no extension", () => {
            expect(isDtsFile("/path/to/file")).toBe(false);
        });

        it("handles empty string", () => {
            expect(isDtsFile("")).toBe(false);
        });
    });

    describe("isDtsVirtualFile", () => {
        it("returns true for paths with virtual prefix", () => {
            expect(
                isDtsVirtualFile(`${DTS_VIRTUAL_FILE_PREFIX}file.d.ts`),
            ).toBe(true);
        });

        it("returns false for paths without virtual prefix", () => {
            expect(isDtsVirtualFile("file.d.ts")).toBe(false);
        });

        it("returns false for empty string", () => {
            expect(isDtsVirtualFile("")).toBe(false);
        });

        it("handles paths with virtual prefix substring in the middle", () => {
            const filePath = `/some/path/${DTS_VIRTUAL_FILE_PREFIX}file.d.ts`;
            expect(isDtsVirtualFile(filePath)).toBe(false);
        });
    });

    describe("removeDtsVirtualPrefix", () => {
        it("removes virtual prefix from path", () => {
            const originalPath = "file.d.ts";
            const virtualPath = `${DTS_VIRTUAL_FILE_PREFIX}${originalPath}`;
            expect(removeDtsVirtualPrefix(virtualPath)).toBe(originalPath);
        });

        it("leaves path unchanged if no virtual prefix", () => {
            const originalPath = "file.d.ts";
            expect(removeDtsVirtualPrefix(originalPath)).toBe(originalPath);
        });

        it("handles empty string", () => {
            expect(removeDtsVirtualPrefix("")).toBe("");
        });

        it("handles multiple occurrences of the prefix", () => {
            const virtualPrefix = DTS_VIRTUAL_FILE_PREFIX;
            const path = `${virtualPrefix}${virtualPrefix}file.d.ts`;
            expect(removeDtsVirtualPrefix(path)).toBe(
                `${virtualPrefix}file.d.ts`,
            );
        });
    });

    describe("addDtsVirtualPrefix", () => {
        it("adds virtual prefix to path", () => {
            const originalPath = "file.d.ts";
            expect(addDtsVirtualPrefix(originalPath)).toBe(
                `${DTS_VIRTUAL_FILE_PREFIX}${originalPath}`,
            );
        });

        it("handles empty string", () => {
            expect(addDtsVirtualPrefix("")).toBe(DTS_VIRTUAL_FILE_PREFIX);
        });

        it("handles absolute paths", () => {
            const originalPath = "/absolute/path/file.d.ts";
            expect(addDtsVirtualPrefix(originalPath)).toBe(
                `${DTS_VIRTUAL_FILE_PREFIX}${originalPath}`,
            );
        });

        it("handles relative paths", () => {
            const originalPath = "./relative/path/file.d.ts";
            expect(addDtsVirtualPrefix(originalPath)).toBe(
                `${DTS_VIRTUAL_FILE_PREFIX}${originalPath}`,
            );
        });

        it("adds prefix even if path already has prefix", () => {
            const originalPath = `${DTS_VIRTUAL_FILE_PREFIX}file.d.ts`;
            expect(addDtsVirtualPrefix(originalPath)).toBe(
                `${DTS_VIRTUAL_FILE_PREFIX}${originalPath}`,
            );
        });
    });
});
