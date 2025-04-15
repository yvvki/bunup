import { describe, expect, it } from "vitest";
import {
    addDtsVirtualPrefix,
    extractPathAliases,
    getBaseUrl,
    getDtsPath,
    isDtsVirtualFile,
    removeDtsVirtualPrefix,
} from "../src/dts/utils";
import { DTS_VIRTUAL_FILE_PREFIX } from "../src/dts/virtual-files";
import type { TsConfigData } from "../src/loaders";

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
    });

    describe("getBaseUrl", () => {
        it("returns baseUrl from tsconfig when specified", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        baseUrl: "./src",
                        paths: {},
                    },
                },
            };
            expect(getBaseUrl(tsconfig)).toBe("/project/src");
        });

        it("returns directory of tsconfig when baseUrl not specified", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        paths: {},
                    },
                },
            };
            expect(getBaseUrl(tsconfig)).toBe("/project");
        });

        it("returns directory of tsconfig when compilerOptions not specified", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {},
            };
            expect(getBaseUrl(tsconfig)).toBe("/project");
        });

        it("returns empty string when tsconfig path not specified", () => {
            const tsconfig: TsConfigData = {
                tsconfig: {
                    compilerOptions: {
                        baseUrl: "./src",
                    },
                },
                path: null,
            };
            expect(getBaseUrl(tsconfig)).toBe("");
        });

        it("handles tsconfig in nested directories", () => {
            const tsconfig: TsConfigData = {
                path: "/project/configs/tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        baseUrl: "../src",
                    },
                },
            };
            expect(getBaseUrl(tsconfig)).toBe("/project/src");
        });
    });

    describe("extractPathAliases", () => {
        it("extracts path aliases with wildcards", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        baseUrl: "./",
                        paths: {
                            "@/*": ["src/*"],
                            "components/*": ["src/components/*"],
                        },
                    },
                },
            };

            const aliases = extractPathAliases(tsconfig);
            expect(aliases.size).toBe(2);
            expect(aliases.get("^@/(.*)$")).toBe("/project/src/$1");
            expect(aliases.get("^components/(.*)$")).toBe(
                "/project/src/components/$1",
            );
        });

        it("returns empty map when no paths in tsconfig", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        baseUrl: "./",
                    },
                },
            };

            const aliases = extractPathAliases(tsconfig);
            expect(aliases.size).toBe(0);
        });

        it("returns empty map when no compilerOptions in tsconfig", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {},
            };

            const aliases = extractPathAliases(tsconfig);
            expect(aliases.size).toBe(0);
        });

        it("returns empty map for empty tsconfig", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {},
            };

            const aliases = extractPathAliases(tsconfig);
            expect(aliases.size).toBe(0);
        });

        it("handles path aliases without wildcards", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        baseUrl: "./",
                        paths: {
                            "@utils": ["src/utils/index.ts"],
                            "@types": ["src/types.ts"],
                        },
                    },
                },
            };

            const aliases = extractPathAliases(tsconfig);
            expect(aliases.size).toBe(2);
            expect(aliases.get("^@utils$")).toBe("/project/src/utils/index.ts");
            expect(aliases.get("^@types$")).toBe("/project/src/types.ts");
        });

        it("handles path aliases with multiple targets (uses the first one)", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        baseUrl: "./",
                        paths: {
                            "@/*": ["src/*", "lib/*"],
                            utils: ["src/utils/index.ts", "lib/utils/index.ts"],
                        },
                    },
                },
            };

            const aliases = extractPathAliases(tsconfig);
            expect(aliases.size).toBe(2);
            expect(aliases.get("^@/(.*)$")).toBe("/project/src/$1");
            expect(aliases.get("^utils$")).toBe("/project/src/utils/index.ts");
        });

        it("ignores empty array targets", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        baseUrl: "./",
                        paths: {
                            "@/*": ["src/*"],
                            utils: [],
                        },
                    },
                },
            };

            const aliases = extractPathAliases(tsconfig);
            expect(aliases.size).toBe(1);
            expect(aliases.get("^@/(.*)$")).toBe("/project/src/$1");
        });

        it("handles complex path mappings with multiple wildcards", () => {
            const tsconfig: TsConfigData = {
                path: "/project/tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        baseUrl: "./",
                        paths: {
                            "@api/v*/*": ["src/api/v*/endpoints/*"],
                        },
                    },
                },
            };

            const aliases = extractPathAliases(tsconfig);
            expect(aliases.size).toBe(1);
            expect(aliases.get("^@api/v(.*)/(.*)$")).toBe(
                "/project/src/api/v$1/endpoints/$2",
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
