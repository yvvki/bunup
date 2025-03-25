import {runDtsInWorker} from './dts/worker';
import {BunupBuildError, BunupDTSBuildError, parseErrorMessage} from './errors';
import {
      getEntryNamingFormat,
      normalizeEntryToProcessableEntries,
      ProcessableEntry,
} from './helpers/entry';
import {getExternalPatterns, getNoExternalPatterns} from './helpers/external';
import {loadPackageJson} from './loaders';
import {getLoggerProgressLabel, logger} from './logger';
import {BunupOptions, createDefaultBunBuildOptions, Format} from './options';
import {externalPlugin} from './plugins/external';
import {BunPlugin} from './types';
import {
      formatFileSize,
      formatTime,
      getDefaultOutputExtension,
      getResolvedSplitting,
      isModulePackage,
} from './utils';

export async function build(
      options: BunupOptions,
      rootDir: string,
): Promise<void> {
      if (!options.entry || options.entry.length === 0 || !options.outDir) {
            throw new BunupBuildError(
                  'Nothing to build. Please make sure you have provided a proper bunup configuration or cli arguments.',
            );
      }

      const startTime = performance.now();

      const packageJson = loadPackageJson(rootDir);
      const packageType = packageJson?.type as string | undefined;

      const externalPatterns = getExternalPatterns(options, packageJson);

      const noExternalPatterns = getNoExternalPatterns(options);

      const plugins = [externalPlugin(externalPatterns, noExternalPatterns)];

      const processableEntries = normalizeEntryToProcessableEntries(
            options.entry,
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
                  );
            }),
      );

      try {
            await Promise.all(buildPromises);

            const buildTimeMs = performance.now() - startTime;
            const timeDisplay = formatTime(buildTimeMs);
            logger.cli(`📦 Build success in ${timeDisplay}`);
      } catch {
            throw new BunupBuildError('Build process encountered errors');
      }

      if (options.dts) {
            const formatsToProcess = options.format.filter(fmt => {
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
                  options.dts === true
                        ? processableEntries
                        : normalizeEntryToProcessableEntries(options.dts.entry);

            try {
                  await runDtsInWorker(
                        rootDir,
                        dtsEntry,
                        formatsToProcess,
                        options,
                        packageType,
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
): Promise<void> {
      const extension = getDefaultOutputExtension(fmt, packageType);
      const defaultBunBuildOptions = createDefaultBunBuildOptions(
            options,
            rootDir,
      );
      const result = await Bun.build({
            ...defaultBunBuildOptions,
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
            throw new BunupBuildError(`Build failed for ${entry} (${fmt})`);
      }

      const outputPath = `${options.outDir}/${entry.name}${extension}`;
      const fileSize = Bun.file(outputPath).size || 0;

      logger.progress(
            getLoggerProgressLabel(fmt, options.name),
            outputPath,
            formatFileSize(fileSize),
      );
}
