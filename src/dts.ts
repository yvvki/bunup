import fs from 'node:fs';
import path from 'node:path';

import oxc from 'oxc-transform';
import {rollup, RollupBuild} from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';
import ts from 'typescript';

import {parseErrorMessage} from './errors';
import {getExternalPatterns, getNoExternalPatterns} from './helpers/external';
import {loadPackageJson, loadTsconfig} from './loaders';
import {logger} from './logger';
import {BunupOptions, DtsOptions, Format} from './options';

export async function generateDts(
    rootDir: string,
    entry: string,
    format: Format,
    options: BunupOptions,
): Promise<string> {
    const {absoluteRootDir, absoluteEntry} = validateInputs(rootDir, entry);
    const tsFiles = await collectTsFiles(absoluteEntry);
    const dtsMap = await generateDtsContent(tsFiles);
    return bundleDtsContent(
        absoluteEntry,
        dtsMap,
        format,
        options,
        absoluteRootDir,
    );
}

async function collectTsFiles(entry: string): Promise<Set<string>> {
    const visited = new Set<string>();
    const toVisit: string[] = [entry];

    while (toVisit.length > 0) {
        const current = toVisit.pop();
        if (!current || visited.has(current)) continue;
        visited.add(current);

        try {
            const sourceText = await fs.promises.readFile(current, 'utf8');
            const relativeImports = extractRelativeImports(sourceText);

            for (const relImport of relativeImports) {
                const importDir = path.dirname(current);
                const absImport = path.resolve(importDir, relImport);

                const possiblePaths = [
                    absImport,
                    `${absImport}.ts`,
                    `${absImport}.tsx`,
                    `${absImport}/index.ts`,
                    `${absImport}/index.tsx`,
                ];

                for (const tsFile of possiblePaths) {
                    if (
                        fs.existsSync(tsFile) &&
                        tsFile.endsWith('.ts') &&
                        !visited.has(tsFile)
                    ) {
                        toVisit.push(tsFile);
                        break;
                    }
                }
            }
        } catch (error) {
            logger.warn(
                `Error processing ${current}: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    return visited;
}

function extractRelativeImports(sourceText: string): string[] {
    const imports = new Set<string>();

    // patterns:
    // 1. Regular imports: import X from './module'
    // 2. Side-effect imports: import './module'
    // 3. Type imports: import type { X } from './module'
    // 4. Re-exports: export X from './module', export * from './module'
    // 5. Dynamic imports: import('./module')

    try {
        const importExportRegex =
            /(?:import|export)(?:(?:[\s\n]*(?:type[\s\n]+)?(?:\*|\{[^}]*\}|[\w$]+)[\s\n]+from[\s\n]*)|[\s\n]+)(["'`])([^'"]+)\1/g;
        let match;
        while ((match = importExportRegex.exec(sourceText)) !== null) {
            const importPath = match[2];
            if (importPath.startsWith('.')) {
                imports.add(importPath);
            }
        }

        const sideEffectImportRegex = /import\s+(["'`])([^'"]+)\1\s*;?/g;
        while ((match = sideEffectImportRegex.exec(sourceText)) !== null) {
            const importPath = match[2];
            if (importPath.startsWith('.')) {
                imports.add(importPath);
            }
        }

        const dynamicImportRegex = /import\s*\(\s*(["'`])([^'"]+)\1\s*\)/g;
        while ((match = dynamicImportRegex.exec(sourceText)) !== null) {
            const importPath = match[2];
            if (importPath.startsWith('.')) {
                imports.add(importPath);
            }
        }
    } catch (error) {
        logger.warn(
            `Error extracting imports: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    return Array.from(imports);
}

async function generateDtsContent(
    tsFiles: Set<string>,
): Promise<Map<string, string>> {
    const dtsMap = new Map<string, string>();

    await Promise.all(
        Array.from(tsFiles).map(async tsFile => {
            try {
                const dtsPath = tsFile.replace(/\.tsx?$/, '.d.ts');
                const sourceText = await fs.promises.readFile(tsFile, 'utf8');
                const {code: declaration} = oxc.isolatedDeclaration(
                    tsFile,
                    sourceText,
                );

                if (declaration) {
                    dtsMap.set(dtsPath, declaration);
                }
            } catch (error) {
                logger.warn(
                    `Failed to generate declaration for ${tsFile}: ${error instanceof Error ? error.message : String(error)}`,
                );
            }
        }),
    );

    return dtsMap;
}

async function bundleDtsContent(
    entryFile: string,
    dtsMap: Map<string, string>,
    format: Format,
    options: BunupOptions,
    rootDir: string,
): Promise<string> {
    const VIRTUAL_PREFIX = '\0virtual:';
    const entryDtsPath = entryFile.replace(/\.tsx?$/, '.d.ts');
    const virtualEntry = `${VIRTUAL_PREFIX}${entryDtsPath}`;

    const dtsOptions =
        typeof options.dts === 'object' ? options.dts : ({} as DtsOptions);

    const tsconfigPath = dtsOptions.preferredTsconfigPath
        ? path.resolve(dtsOptions.preferredTsconfigPath)
        : path.join(rootDir, 'tsconfig.json');

    const tsconfig = await loadTsconfig(tsconfigPath);
    const compilerOptions = tsconfig.compilerOptions;

    const virtualPlugin = {
        name: 'bunup:virtual-dts',
        resolveId(source: string, importer: string | undefined) {
            if (source.startsWith(VIRTUAL_PREFIX)) {
                return source;
            }

            if (importer?.startsWith(VIRTUAL_PREFIX)) {
                const importerPath = importer.slice(VIRTUAL_PREFIX.length);
                const importerDir = path.dirname(importerPath);

                if (source.startsWith('.')) {
                    const resolvedPath = path.resolve(importerDir, source);

                    for (const ext of ['', '.d.ts', '/index.d.ts']) {
                        const fullPath = `${resolvedPath}${ext}`;
                        if (dtsMap.has(fullPath)) {
                            return `${VIRTUAL_PREFIX}${fullPath}`;
                        }
                    }
                }
            }
            return null;
        },
        load(id: string) {
            if (id.startsWith(VIRTUAL_PREFIX)) {
                const actualPath = id.slice(VIRTUAL_PREFIX.length);
                return dtsMap.get(actualPath) || null;
            }
            return null;
        },
    };

    const packageJson = loadPackageJson(rootDir);
    const externalPatterns = getExternalPatterns(options, packageJson);
    const noExternalPatterns = getNoExternalPatterns(options);

    let bundle: RollupBuild | undefined;

    try {
        bundle = await rollup({
            input: virtualEntry,
            onwarn(warning, handler) {
                if (
                    warning.code === 'UNRESOLVED_IMPORT' ||
                    warning.code === 'CIRCULAR_DEPENDENCY' ||
                    warning.code === 'EMPTY_BUNDLE'
                ) {
                    return;
                }
                handler(warning);
            },
            plugins: [
                virtualPlugin,
                dtsPlugin({
                    tsconfig: tsconfigPath,
                    compilerOptions: {
                        ...(compilerOptions
                            ? ts.parseJsonConfigFileContent(
                                  {compilerOptions},
                                  ts.sys,
                                  './',
                              ).options
                            : {}),
                        declaration: true,
                        noEmit: false,
                        emitDeclarationOnly: true,
                        noEmitOnError: true,
                        checkJs: false,
                        declarationMap: false,
                        skipLibCheck: true,
                        preserveSymlinks: false,
                        target: ts.ScriptTarget.ESNext,
                    },
                }),
            ],
            external: (source: string) =>
                externalPatterns.some(re => re.test(source)) &&
                !noExternalPatterns.some(re => re.test(source)),
        });

        const {output} = await bundle.generate({format});

        if (!output[0]?.code) {
            throw new Error('Generated bundle is empty');
        }

        return output[0].code;
    } catch (error) {
        throw new Error(`DTS bundling failed: ${parseErrorMessage(error)}`);
    } finally {
        if (bundle) await bundle.close();
    }
}

function validateInputs(rootDir: string, entry: string) {
    const absoluteRootDir = path.resolve(rootDir);
    const absoluteEntry = path.resolve(absoluteRootDir, entry);

    if (!fs.existsSync(absoluteRootDir)) {
        throw new Error(`Root directory does not exist: ${absoluteRootDir}`);
    }
    if (!fs.existsSync(absoluteEntry)) {
        throw new Error(`Entry file does not exist: ${absoluteEntry}`);
    }
    if (!absoluteEntry.endsWith('.ts')) {
        throw new Error(
            `Entry file must be a TypeScript file (.ts): ${absoluteEntry}`,
        );
    }
    if (path.relative(absoluteRootDir, absoluteEntry).startsWith('..')) {
        throw new Error(`Entry file must be within rootDir: ${absoluteEntry}`);
    }

    return {absoluteRootDir, absoluteEntry};
}
