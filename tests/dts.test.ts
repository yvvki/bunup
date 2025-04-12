import { beforeEach, describe, expect, it } from "vitest";
import { cleanProjectDir, createProject, findFile, runDtsBuild } from "./utils";

describe("dts", () => {
    beforeEach(() => {
        cleanProjectDir();
    });

    it("should generate basic dts files", async () => {
        createProject({
            "src/index.ts": `
                export interface User {
                    id: number;
                    name: string;
                }
                
                export function getUserName(user: User): string {
                    return user.name;
                }
            `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["esm"],
        });

        expect(result.success).toBe(true);
        const dtsFile = findFile(result, "index", ".d.mts");
        expect(dtsFile).toBeDefined();
        expect(dtsFile?.content).toContain("interface User");
        expect(dtsFile?.content).toContain("function getUserName");
    });

    it("should handle imports and exports between multiple files", async () => {
        createProject({
            "src/index.ts": `
                    export * from './user';
                    export * from './utils';
                `,
            "src/user.ts": `
                    export interface User {
                        id: number;
                        name: string;
                        email: string;
                    }

                    export class UserService {
                        getUser(id: number): User {
                            return { id, name: 'Test', email: 'test@example.com' };
                        }
                    }
                `,
            "src/utils.ts": `
                    export function formatId(id: number): string {
                        return \`ID-\${id.toString().padStart(5, '0')}\`;
                    }
                `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["esm", "cjs"],
        });

        expect(result.success).toBe(true);

        const esmDtsFile = findFile(result, "index", ".d.mts");
        expect(esmDtsFile).toBeDefined();
        expect(esmDtsFile?.content).toContain("interface User");
        expect(esmDtsFile?.content).toContain("class UserService");
        expect(esmDtsFile?.content).toContain("function formatId");

        const cjsDtsFile = findFile(result, "index", ".d.ts");
        expect(cjsDtsFile).toBeDefined();
        expect(cjsDtsFile?.content).toContain("interface User");
        expect(cjsDtsFile?.content).toContain("class UserService");
        expect(cjsDtsFile?.content).toContain("function formatId");
    });

    it("should handle path aliases in tsconfig", async () => {
        createProject({
            "tsconfig.json": JSON.stringify({
                compilerOptions: {
                    baseUrl: ".",
                    paths: {
                        "@models/*": ["src/models/*"],
                        "@utils/*": ["src/utils/*"],
                    },
                },
            }),
            "src/index.ts": `
                    import { Product } from '@models/product';
                    import { formatPrice } from '@utils/formatter';

                    export function displayProduct(product: Product): string {
                        return \`\${product.name}: \${formatPrice(product.price)}\`;
                    }

                    export type { Product } from '@models/product';
                `,
            "src/models/product.ts": `
                    export interface Product {
                        id: number;
                        name: string;
                        price: number;
                    }
                `,
            "src/utils/formatter.ts": `
                    export function formatPrice(price: number): string {
                        return \`$\${price.toFixed(2)}\`;
                    }
                `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["esm"],
        });

        expect(result.success).toBe(true);
        const dtsFile = findFile(result, "index", ".d.mts");
        expect(dtsFile).toBeDefined();
        expect(dtsFile?.content).toContain("interface Product");
        expect(dtsFile?.content).toContain("declare function displayProduct");
        expect(dtsFile?.content).toContain(
            "export { Product, displayProduct }",
        );
    });

    it("should handle circular dependencies", async () => {
        createProject({
            "src/index.ts": `
                    export * from './a';
                    export * from './b';
                `,
            "src/a.ts": `
                    import { B } from './b';

                    export interface A {
                        id: number;
                        name: string;
                        b?: B;
                    }

                    export function createA(name: string): A {
                        return { id: 1, name };
                    }
                `,
            "src/b.ts": `
                    import { A } from './a';

                    export interface B {
                        id: number;
                        code: string;
                        a?: A;
                    }

                    export function createB(code: string): B {
                        return { id: 1, code };
                    }
                `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["esm"],
        });

        expect(result.success).toBe(true);
        const dtsFile = findFile(result, "index", ".d.mts");
        expect(dtsFile).toBeDefined();
        expect(dtsFile?.content).toContain("interface A");
        expect(dtsFile?.content).toContain("interface B");
        expect(dtsFile?.content).toContain("function createA");
        expect(dtsFile?.content).toContain("function createB");
    });

    it("should handle type-only imports and exports", async () => {
        createProject({
            "src/index.ts": `
                    import type { Config } from './types';

                    export function initialize(config: Config): void {
                        console.log(config);
                    }

                    export type { ConfigKey } from './types';
                `,
            "src/types.ts": `
                    export interface Config {
                        apiKey: string;
                        timeout: number;
                        debug?: boolean;
                    }

                    export type ConfigKey = keyof Config;
                `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["esm"],
        });

        expect(result.success).toBe(true);
        const dtsFile = findFile(result, "index", ".d.mts");
        expect(dtsFile).toBeDefined();
        expect(dtsFile?.content).toContain(
            "declare function initialize(config: Config)",
        );
        expect(dtsFile?.content).toContain("type ConfigKey = keyof Config");
        expect(dtsFile?.content).toContain("interface Config");
        expect(dtsFile?.content).not.toContain(
            "export type { Config, ConfigKey }",
        );
    });

    it("should handle triple-slash directives", async () => {
        createProject({
            "package.json": JSON.stringify({
                name: "test-package",
                version: "1.0.0",
                type: "module",
                dependencies: {
                    fs: "^1.0.0",
                },
            }),
            "src/index.ts": `
                    /// <reference path="./types.d.ts" />

                    import { readFileSync } from 'fs';

                    export function loadConfig(path: string): Config {
                        return JSON.parse(readFileSync(path, 'utf-8'));
                    }
                `,
            "src/types.d.ts": `
                    interface Config {
                        appName: string;
                        version: string;
                        features: string[];
                    }
                `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["cjs"],
        });

        expect(result.success).toBe(true);
        const dtsFile = findFile(result, "index", ".d.cts");
        expect(dtsFile).toBeDefined();
        expect(dtsFile?.content).toContain("declare function loadConfig");
        // TODO: uncomment these expectations after rolldown-plugin-dts solves this issue: https://github.com/sxzz/rolldown-plugin-dts/issues/5
        // expect(dtsFile?.content).toContain("interface Config");
        // expect(dtsFile?.content).toContain("appName");
    });

    it("should handle dynamic imports", async () => {
        createProject({
            "src/index.ts": `
                    export async function loadFeature(name: string): Promise<typeof Dashboard | typeof Settings> {
                        if (name === 'dashboard') {
                            const { Dashboard } = await import('./features/dashboard');
                            return Dashboard
                        } else {
                            const { Settings } = await import('./features/settings');
                            return Settings;
                        }
                    }
                `,
            "src/features/dashboard.ts": `
                    export class Dashboard {
                        title = 'Main Dashboard';
                        render() {
                            return this.title;
                        }
                    }
                `,
            "src/features/settings.ts": `
                    export class Settings {
                        title = 'User Settings';
                        render() {
                            return this.title;
                        }
                    }
                `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["cjs"],
        });

        expect(result.success).toBe(true);
        const dtsFile = findFile(result, "index", ".d.ts");
        expect(dtsFile).toBeDefined();
        expect(dtsFile?.content).toContain("declare function loadFeature");
    });

    it("should handle export = syntax", async () => {
        createProject({
            "src/index.ts": `
                    import Logger = require('./logger');

                    export function createLogger(name: string) {
                        return new Logger(name);
                    }

                    export { Logger };
                `,
            "src/logger.ts": `
                    class Logger {
                        constructor(private name: string) {}

                        log(message: string) {
                            console.log(\`[\${this.name}] \${message}\`);
                        }
                    }

                    export = Logger;
                `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["iife"],
        });

        expect(result.success).toBe(true);
        const dtsFile = findFile(result, "index", ".d.ts");
        expect(dtsFile).toBeDefined();
        expect(dtsFile?.content).toContain("declare function createLogger");
        expect(dtsFile?.content).toContain(
            "export { logger_d_default as Logger, createLogger };",
        );
    });

    it("should respect custom dts.resolve configuration", async () => {
        createProject({
            "package.json": JSON.stringify({
                name: "test-package",
                version: "1.0.0",
                devDependencies: {
                    "external-lib": "^1.0.0",
                },
            }),
            "src/index.ts": `
                    import { SomeType } from 'external-lib';

                    export function process(data: SomeType) {
                        return data;
                    }
                `,
            "node_modules/external-lib/index.d.ts": `
                    export interface SomeType {
                        id: number;
                        value: string;
                    }
                `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["esm"],
            dts: {
                resolve: true,
            },
        });

        expect(result.success).toBe(true);
        const dtsFile = findFile(result, "index", ".d.mts");
        expect(dtsFile).toBeDefined();
        expect(dtsFile?.content).toContain("declare function process");
        expect(dtsFile?.content).toContain("interface SomeType");
        expect(dtsFile?.content).toContain("value");
    });

    it("should handle import statements with relative paths properly", async () => {
        createProject({
            "src/index.ts": `
                    export * from './deep/nested/module';
                `,
            "src/deep/nested/module.ts": `
                    import { helper } from '../../utils/helper';

                    export function processData(data: string): string {
                        return helper(data);
                    }

                    export { Helper } from '../../utils/helper';
                `,
            "src/utils/helper.ts": `
                    export function helper(data: string): string {
                        return data.toUpperCase();
                    }

                    export interface Helper {
                        helper: (data: string) => string;
                    }
                `,
        });

        const result = await runDtsBuild({
            entry: ["src/index.ts"],
            format: ["esm"],
        });

        expect(result.success).toBe(true);
        const dtsFile = findFile(result, "index", ".d.mts");
        expect(dtsFile).toBeDefined();
        expect(dtsFile?.content).toContain("declare function processData");
        expect(dtsFile?.content).toContain("interface Helper");
        expect(dtsFile?.content).toContain("helper: (data: string) => string");
    });
});
