import type { BunPlugin } from "bun";
import { beforeEach, describe, expect, it } from "vitest";
import {
    cleanProjectDir,
    createProject,
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

    it("should handle all supported file extensions simultaneously with DTS generation", async () => {
        createProject({
            "package.json": JSON.stringify({
                name: "test-package",
                version: "1.0.0",
                dependencies: {
                    react: "^19.0.0",
                },
            }),
            "src/js-file.js": "export const jsVar = 1;",
            "src/jsx-file.jsx": "export const jsxVar = () => <div>JSX</div>;",
            "src/ts-file.ts": "export const tsVar: number = 2;",
            "src/tsx-file.tsx":
                "export const tsxComponent = () => <div>TSX</div>;",
            "src/mjs-file.mjs": "export const mjsVar = 3;",
            "src/cjs-file.cjs": "exports.cjsVar = 4;",
            "src/mts-file.mts": "export const mtsVar: number = 5;",
            "src/cts-file.cts": "export const ctsVar: number = 6;",
        });

        const result = await runBuild({
            entry: [
                "src/js-file.js",
                "src/jsx-file.jsx",
                "src/ts-file.ts",
                "src/tsx-file.tsx",
                "src/mjs-file.mjs",
                "src/cjs-file.cjs",
                "src/mts-file.mts",
                "src/cts-file.cts",
            ],
            format: ["esm", "cjs"],
            dts: true,
        });

        expect(result.success).toBe(true);
        expect(
            validateBuildFiles(result, {
                expectedFiles: [
                    "js-file.mjs",
                    "jsx-file.mjs",
                    "ts-file.mjs",
                    "tsx-file.mjs",
                    "mjs-file.mjs",
                    "cjs-file.mjs",
                    "mts-file.mjs",
                    "cts-file.mjs",

                    "js-file.js",
                    "jsx-file.js",
                    "ts-file.js",
                    "tsx-file.js",
                    "mjs-file.js",
                    "cjs-file.js",
                    "mts-file.js",
                    "cts-file.js",

                    "ts-file.d.ts",
                    "tsx-file.d.ts",
                    "mts-file.d.ts",
                    "cts-file.d.ts",
                    "ts-file.d.mts",
                    "tsx-file.d.mts",
                    "mts-file.d.mts",
                    "cts-file.d.mts",
                ],
            }),
        ).toBe(true);
    });

    it("should treat dependencies as external by default", async () => {
        createProject({
            "src/index.ts": `
                import chalk from 'chalk';

                console.log(chalk.red('Hello, world!'));
            `,
        });

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
        });

        expect(result.success).toBe(true);

        expect(result.files[0].content).toContain("chalk");
        expect(result.files[0].content).toMatch(
            /import\s+.*\s+from\s+["']chalk["']/,
        );
    });

    it("should treat peerDependencies as external by default", async () => {
        createProject({
            "src/index.tsx": `
                import ora from 'ora';

                const spinner = ora('Loading...').start();

                setTimeout(() => {
                  spinner.succeed('Done!');
                }, 1000);
            `,
        });

        const result = await runBuild({
            entry: "src/index.tsx",
            format: ["esm"],
        });

        expect(result.success).toBe(true);

        expect(result.files[0].content).toContain("ora");
        expect(result.files[0].content).toMatch(
            /import\s+.*\s+from\s+["']ora["']/,
        );
    });

    it("should not treat devDependencies as external by default", async () => {
        createProject({
            "src/index.ts": `
                import picocolors from 'picocolors';

                console.log(picocolors.red('Hello, world!'));
            `,
        });

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
        });

        expect(result.success).toBe(true);

        expect(result.files[0].content).not.toMatch(
            /import\s+.*\s+from\s+["']picocolors["']/,
        );
    });

    it("should bundle dependencies specified in noExternal option", async () => {
        createProject({
            "src/index.ts": `
                import ora from 'ora';
                import chalk from 'chalk';

                console.log(chalk.red('Hello, world!'));
                ora('Loading...').start();
            `,
        });

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            noExternal: ["ora"],
        });

        expect(result.success).toBe(true);

        expect(result.files[0].content).not.toMatch(
            /import\s+.*\s+from\s+["']ora["']/,
        );

        expect(result.files[0].content).toMatch(
            /import\s+.*\s+from\s+["']chalk["']/,
        );
    });

    it("should support regex patterns in external option", async () => {
        createProject({
            "src/index.ts": `
                import lodashArray from 'lodash/array';
                import lodashObject from 'lodash/object';
                import chalk from 'chalk';

                console.log(chalk.red('Hello, world!'));
                ora('Loading...').start();
                lodashArray.join(['Hello', 'World'], ' ');
                lodashObject.join(['Hello', 'World'], ' ');
            `,
        });

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            external: [/^lodash\//],
        });

        expect(result.success).toBe(true);

        expect(result.files[0].content).toMatch(
            /import\s+.*\s+from\s+["']lodash\/array["']/,
        );
        expect(result.files[0].content).toMatch(
            /import\s+.*\s+from\s+["']lodash\/object["']/,
        );
        expect(result.files[0].content).toMatch(
            /import\s+.*\s+from\s+["']chalk["']/,
        );
    });

    it("should apply custom Bun.build plugins when bunBuildPlugins option is provided", async () => {
        createProject({ "src/index.ts": "export const x = 1;" });

        const testMarker = "/* TEST PLUGIN WAS HERE */";
        const testPlugin: BunPlugin = {
            name: "test-plugin",
            setup(build) {
                build.onLoad({ filter: /\.ts$/ }, async (args) => {
                    const source = await Bun.file(args.path).text();
                    return {
                        contents: `${source}\n// This comment was added by the test plugin`,
                        loader: "ts",
                    };
                });
            },
        };

        const result = await runBuild({
            entry: "src/index.ts",
            format: ["esm"],
            banner: testMarker,
            bunBuildPlugins: [testPlugin],
        });

        expect(result.success).toBe(true);
        expect(
            validateBuildFiles(result, {
                expectedFiles: ["index.mjs"],
            }),
        ).toBe(true);

        expect(result.files[0].content).toContain(testMarker);
    });

    it("should use preferred tsconfig when provided", async () => {
        createProject({
            "tsconfig.json": JSON.stringify({
                compilerOptions: {
                    baseUrl: ".",
                    paths: {
                        "@/*": ["src/*"],
                    },
                },
            }),
            "tsconfig.build.json": JSON.stringify({
                compilerOptions: {
                    baseUrl: ".",
                    paths: {
                        "@/*": ["src/project/*"],
                    },
                },
            }),
            "src/index.ts": "export * from '@/utils';",
            "src/project/utils.ts":
                "export const util = (): string => 'utility';",
        });

        const result = await runDtsBuild({
            entry: "src/index.ts",
            format: ["esm"],
            preferredTsconfigPath: "tsconfig.build.json",
        });

        expect(result.success).toBe(true);
        expect(result.files.length).toBe(1);
        expect(result.files[0].content).toContain(
            "declare const util: () => string",
        );
    });
});
