import path from 'node:path';

import {rollup, RollupBuild} from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';
import ts from 'typescript';

import {allFilesUsedToBundleDts as importedFilesSet} from '../cli';
import {BunupDTSBuildError, parseErrorMessage} from '../errors';
import {getExternalPatterns, getNoExternalPatterns} from '../helpers/external';
import {TsConfig} from '../helpers/load-tsconfig';
import {loadPackageJson} from '../loaders';
import {BunupOptions} from '../options';

const getFilesUsedSet = (): Set<string> => {
        return (
                global.allFilesUsedToBundleDts ||
                importedFilesSet ||
                new Set<string>()
        );
};

export async function bundleDtsContent(
        entryFile: string,
        dtsMap: Map<string, string>,
        options: BunupOptions,
        rootDir: string,
        tsconfig: TsConfig,
): Promise<string> {
        const virtualPrefix = '\0virtual:';
        const entryDtsPath = entryFile.replace(/\.tsx?$/, '.d.ts');
        const virtualEntry = `${virtualPrefix}${entryDtsPath}`;
        const compilerOptions = tsconfig.data?.compilerOptions;

        const virtualPlugin = {
                name: 'bunup:virtual-dts',
                resolveId(source: string, importer?: string) {
                        if (source.startsWith(virtualPrefix)) return source;
                        if (
                                !importer?.startsWith(virtualPrefix) ||
                                !source.startsWith('.')
                        )
                                return null;

                        const importerPath = importer.slice(
                                virtualPrefix.length,
                        );
                        let resolvedPath = path.resolve(
                                path.dirname(importerPath),
                                source,
                        );

                        if (source === '.') {
                                const indexPath = path.join(
                                        path.dirname(importerPath),
                                        'index.d.ts',
                                );
                                if (dtsMap.has(indexPath)) {
                                        return `${virtualPrefix}${indexPath}`;
                                }

                                resolvedPath = path.dirname(importerPath);
                        }

                        if (dtsMap.has(resolvedPath)) {
                                return `${virtualPrefix}${resolvedPath}`;
                        }

                        const fullPath = `${resolvedPath}.d.ts`;
                        if (dtsMap.has(fullPath)) {
                                return `${virtualPrefix}${fullPath}`;
                        }

                        if (source.startsWith('.')) {
                                const indexPath = path.join(
                                        resolvedPath,
                                        'index.d.ts',
                                );
                                if (dtsMap.has(indexPath)) {
                                        return `${virtualPrefix}${indexPath}`;
                                }
                        }

                        return null;
                },
                load(id: string) {
                        if (id.startsWith(virtualPrefix)) {
                                const filePath = id.slice(virtualPrefix.length);
                                const content = dtsMap.get(filePath);
                                if (content) {
                                        getFilesUsedSet().add(filePath);
                                        return content;
                                }
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
                                        [
                                                'UNRESOLVED_IMPORT',
                                                'CIRCULAR_DEPENDENCY',
                                                'EMPTY_BUNDLE',
                                        ].includes(warning.code ?? '')
                                )
                                        return;
                                handler(warning);
                        },
                        plugins: [
                                virtualPlugin,
                                dtsPlugin({
                                        tsconfig: tsconfig.path,
                                        compilerOptions: {
                                                ...(compilerOptions
                                                        ? ts.parseJsonConfigFileContent(
                                                                  {
                                                                          compilerOptions,
                                                                  },
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
                        external: source =>
                                externalPatterns.some(re => re.test(source)) &&
                                !noExternalPatterns.some(re => re.test(source)),
                });

                const {output} = await bundle.generate({});
                if (!output[0]?.code)
                        throw new BunupDTSBuildError(
                                'Generated bundle is empty',
                        );
                return output[0].code;
        } catch (error) {
                throw new BunupDTSBuildError(
                        `DTS bundling failed: ${parseErrorMessage(error)}`,
                );
        } finally {
                if (bundle) await bundle.close();
        }
}
