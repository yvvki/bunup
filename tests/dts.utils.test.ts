import { describe, expect, it } from "vitest";
import {
    addDtsVirtualPrefix,
    getDtsPath,
    isDtsVirtualFile,
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

        it("handles paths with multiple dots", () => {
            expect(getDtsPath("/path/to/file.spec.ts")).toBe(
                "/path/to/file.spec.d.ts",
            );
        });

        it("handles paths with no extension (leaves unchanged)", () => {
            expect(getDtsPath("/path/to/file")).toBe("/path/to/file");
        });

        it("handles paths with unsupported extensions (leaves unchanged)", () => {
            expect(getDtsPath("/path/to/file.js")).toBe("/path/to/file.js");
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
