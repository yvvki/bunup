import {rollup, RollupBuild} from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';
import ts from 'typescript';

import {BunupDTSBuildError, parseErrorMessage} from '../errors';
import {getExternalPatterns, getNoExternalPatterns} from '../helpers/external';
import {TsConfig} from '../helpers/load-tsconfig';
import {BunupOptions} from '../options';
import {typesResolvePlugin} from '../plugins/types-resolve';
import {DtsMap} from './generator';
import {gerVirtualFilesPlugin, VIRTUAL_FILES_PREFIX} from './virtual-files';

export async function bundleDts(
      entryFile: string,
      dtsMap: DtsMap,
      options: BunupOptions,
      tsconfig: TsConfig,
      packageJson: Record<string, unknown> | null,
): Promise<string> {
      const entryDtsPath = entryFile.replace(/\.tsx?$/, '.d.ts');
      const virtualEntry = `${VIRTUAL_FILES_PREFIX}${entryDtsPath}`;
      const compilerOptions = tsconfig.data?.compilerOptions;

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
                        gerVirtualFilesPlugin(dtsMap),
                        typeof options.dts === 'object' &&
                              'resolve' in options.dts &&
                              typesResolvePlugin(
                                    typeof options.dts.resolve === 'boolean'
                                          ? undefined
                                          : options.dts.resolve,
                              ),
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
