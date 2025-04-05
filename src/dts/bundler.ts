import {build} from 'rolldown';
import {dts} from 'rolldown-plugin-types';

import {BunupDTSBuildError, parseErrorMessage} from '../errors';
import {getExternalPatterns, getNoExternalPatterns} from '../helpers/external';
import {BunupOptions} from '../options';
import {typesResolvePlugin} from '../plugins/types-resolve';
import {DtsMap} from './generator';
import {gerVirtualFilesPlugin, VIRTUAL_FILES_PREFIX} from './virtual-files';

export async function bundleDts(
      entryFile: string,
      dtsMap: DtsMap,
      options: BunupOptions,
      packageJson: Record<string, unknown> | null,
): Promise<string> {
      const entryDtsPath = entryFile.replace(/\.tsx?$/, '.d.ts');
      const virtualEntry = `${VIRTUAL_FILES_PREFIX}${entryDtsPath}`;

      const externalPatterns = getExternalPatterns(options, packageJson);
      const noExternalPatterns = getNoExternalPatterns(options);

      try {
            const {output} = await build({
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
                        dts(),
                  ],
                  external: source =>
                        externalPatterns.some(re => re.test(source)) &&
                        !noExternalPatterns.some(re => re.test(source)),
                  output: {
                        inlineDynamicImports: true,
                  },
            });

            if (!output[0]?.code)
                  throw new BunupDTSBuildError('Generated bundle is empty');
            return output[0].code;
      } catch (error) {
            throw new BunupDTSBuildError(
                  `DTS bundling failed: ${parseErrorMessage(error)}`,
            );
      }
}
