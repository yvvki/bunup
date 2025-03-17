import fs from 'fs';
import path from 'path';

import {rollup, RollupBuild} from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';
import ts, {ScriptTarget} from 'typescript';

import {parseErrorMessage} from '../errors';
import {getExternalPatterns, getNoExternalPatterns} from '../helpers/external';
import {loadPackageJson, loadTsconfig} from '../loaders';
import {BunupOptions, DtsOptions, Format} from '../options';

export async function generateDts(
    rootDir: string,
    entry: string,
    format: Format,
    options: BunupOptions,
    dtsOptions: Omit<DtsOptions, 'entry'> = {},
): Promise<string> {
    const {absoluteRootDir, absoluteEntry} = validateInputs(rootDir, entry);

    const tsconfigPath = dtsOptions.preferredTsconfigPath
        ? path.resolve(dtsOptions.preferredTsconfigPath)
        : path.join(absoluteRootDir, 'tsconfig.json');

    const tsconfig = await loadTsconfig(tsconfigPath);
    const compilerOptions = tsconfig.compilerOptions;

    const packageJson = loadPackageJson(absoluteRootDir);

    const externalPatterns = getExternalPatterns(options, packageJson);
    const noExternalPatterns = getNoExternalPatterns(options);

    let bundle: RollupBuild | undefined;
    let result: string | undefined;

    try {
        bundle = await rollup({
            input: absoluteEntry,
            onwarn(warning, handler) {
                if (
                    warning.code === 'UNRESOLVED_IMPORT' ||
                    warning.code === 'CIRCULAR_DEPENDENCY' ||
                    warning.code === 'EMPTY_BUNDLE'
                ) {
                    return;
                }
                return handler(warning);
            },
            plugins: [
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
                        target: ScriptTarget.ESNext,
                    },
                }),
            ],
            external: (source: string) =>
                externalPatterns.some(re => re.test(source)) &&
                !noExternalPatterns.some(re => re.test(source)),
        });

        const {output} = await bundle.generate({format});
        result = output[0].code;
    } catch (rollupError) {
        throw new Error(
            `Rollup bundling failed: ${parseErrorMessage(rollupError)}`,
        );
    } finally {
        if (bundle) await bundle.close();
    }

    if (!result) {
        throw new Error('Failed to generate bundled DTS content');
    }

    return result;
}

function validateInputs(
    rootDir: string,
    entry: string,
): {absoluteRootDir: string; absoluteEntry: string} {
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
