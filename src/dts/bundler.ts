import path from 'node:path';

import {rollup, RollupBuild} from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';
import ts from 'typescript';

import {BunupDTSBuildError, parseErrorMessage} from '../errors';
import {getExternalPatterns, getNoExternalPatterns} from '../helpers/external';
import {TsConfig} from '../helpers/load-tsconfig';
import {loadPackageJson} from '../loaders';
import {BunupOptions, Format} from '../options';

export async function bundleDtsContent(
    entryFile: string,
    dtsMap: Map<string, string>,
    format: Format,
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
            if (!importer?.startsWith(virtualPrefix) || !source.startsWith('.'))
                return null;

            const importerPath = importer.slice(virtualPrefix.length);
            const resolvedPath = path.resolve(
                path.dirname(importerPath),
                source,
            );
            const fullPath = dtsMap.has(resolvedPath)
                ? resolvedPath
                : `${resolvedPath}.d.ts`;
            return dtsMap.has(fullPath) ? `${virtualPrefix}${fullPath}` : null;
        },
        load(id: string) {
            return id.startsWith(virtualPrefix)
                ? dtsMap.get(id.slice(virtualPrefix.length)) || null
                : null;
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
            external: source =>
                externalPatterns.some(re => re.test(source)) &&
                !noExternalPatterns.some(re => re.test(source)),
        });

        const {output} = await bundle.generate({format});
        if (!output[0]?.code)
            throw new BunupDTSBuildError('Generated bundle is empty');
        return output[0].code;
    } catch (error) {
        throw new BunupDTSBuildError(
            `DTS bundling failed: ${parseErrorMessage(error)}`,
        );
    } finally {
        if (bundle) await bundle.close();
    }
}
