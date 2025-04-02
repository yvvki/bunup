import {generateDts} from './dts';
import {BunupBuildError, BunupDTSBuildError, parseErrorMessage} from './errors';
import {
      getEntryNamingFormat,
      normalizeEntryToProcessableEntries,
      ProcessableEntry,
} from './helpers/entry';
import {getExternalPatterns, getNoExternalPatterns} from './helpers/external';
import {loadTsconfig} from './helpers/load-tsconfig';
import {loadPackageJson} from './loaders';
import {logger} from './logger';
import {BunupOptions, createDefaultBunBuildOptions, Format} from './options';
import {externalPlugin} from './plugins/external';
import {BunBuildOptions, BunPlugin} from './types';
import {
      formatFileSize,
      getDefaultDtsExtention,
      getDefaultOutputExtension,
      getResolvedSplitting,
      getShortFilePath,
      isModulePackage,
} from './utils';

export const allFilesUsedToBundleDts: Set<string> = new Set<string>();

export async function build(
      options: BunupOptions,
      rootDir: string,
): Promise<void> {
      if (!options.entry || options.entry.length === 0 || !options.outDir) {
            throw new BunupBuildError(
                  'Nothing to build. Please make sure you have provided a proper bunup configuration or cli arguments.',
            );
      }

      const {packageJson, path} = await loadPackageJson(rootDir);

      if (packageJson) {
            logger.cli(`Using package.json: ${getShortFilePath(path)}`, {
                  muted: true,
            });
      }

      const packageType = packageJson?.type as string | undefined;
      const externalPatterns = getExternalPatterns(options, packageJson);
      const noExternalPatterns = getNoExternalPatterns(options);
      const plugins = [externalPlugin(externalPatterns, noExternalPatterns)];
      const processableEntries = normalizeEntryToProcessableEntries(
            options.entry,
      );
      const defaultBunBuildOptions = createDefaultBunBuildOptions(
            options,
            rootDir,
      );

      const buildPromises = options.format.flatMap(fmt =>
            processableEntries.map(entry => {
                  return buildEntry(
                        options,
                        rootDir,
                        entry,
                        fmt,
                        packageType,
                        plugins,
                        defaultBunBuildOptions,
                  );
            }),
      );

      try {
            await Promise.all(buildPromises);
      } catch (error) {
            console.error(error);
            throw new BunupBuildError('Build process encountered errors');
      }

      if (options.dts) {
            const tsconfig = loadTsconfig(options.preferredTsconfigPath);

            if (tsconfig.path) {
                  logger.cli(
                        `Using tsconfig: ${getShortFilePath(tsconfig.path)}`,
                        {
                              muted: true,
                        },
                  );
            }

            const formatsToProcessDts = options.format.filter(fmt => {
                  if (
                        fmt === 'iife' &&
                        !isModulePackage(packageType) &&
                        options.format.includes('cjs')
                  ) {
                        return false;
                  }
                  return true;
            });

            const dtsEntry =
                  typeof options.dts === 'object' && options.dts.entry
                        ? normalizeEntryToProcessableEntries(options.dts.entry)
                        : processableEntries;

            try {
                  await Promise.all(
                        dtsEntry.map(async entry => {
                              const content = await generateDts(
                                    rootDir,
                                    entry.path,
                                    options,
                                    tsconfig,
                                    packageJson,
                              );

                              await Promise.all(
                                    formatsToProcessDts.map(async fmt => {
                                          const extension =
                                                getDefaultDtsExtention(
                                                      fmt,
                                                      packageType,
                                                );
                                          const outputPath = `${rootDir}/${options.outDir}/${entry.name}${extension}`;

                                          await Bun.write(outputPath, content);
                                          const fileSize =
                                                Bun.file(outputPath).size || 0;

                                          logger.progress(
                                                'DTS',
                                                getShortFilePath(outputPath),
                                                formatFileSize(fileSize),
                                                options.name,
                                          );
                                    }),
                              );
                        }),
                  );
            } catch (error) {
                  throw new BunupDTSBuildError(
                        `DTS build process encountered errors: ${parseErrorMessage(error)}`,
                  );
            }
      }
}

async function buildEntry(
      options: BunupOptions,
      rootDir: string,
      entry: ProcessableEntry,
      fmt: Format,
      packageType: string | undefined,
      plugins: BunPlugin[],
      defaultBuildOptions: Omit<BunBuildOptions, 'entrypoints'>,
): Promise<void> {
      const extension = getDefaultOutputExtension(fmt, packageType);

      const result = await Bun.build({
            ...defaultBuildOptions,
            entrypoints: [`${rootDir}/${entry.path}`],
            format: fmt,
            naming: {entry: getEntryNamingFormat(entry.name, extension)},
            splitting: getResolvedSplitting(options.splitting, fmt),
            plugins,
            throw: false,
      });

      if (!result.success) {
            result.logs.forEach(log => {
                  if (log.level === 'error') logger.error(log.message);
                  else if (log.level === 'warning') logger.warn(log.message);
                  else if (log.level === 'info') logger.info(log.message);
            });
            throw new BunupBuildError(
                  `Build failed for ${entry.path} (${fmt})`,
            );
      }

      const outputPath = `${rootDir}/${options.outDir}/${entry.name}${extension}`;
      const fileSize = Bun.file(outputPath).size || 0;

      logger.progress(
            fmt.toUpperCase(),
            getShortFilePath(outputPath),
            formatFileSize(fileSize),
            options.name,
      );
}
