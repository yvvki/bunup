import {DtsWorker, DtsWorkerMessageEventData} from './dts/worker';
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
        logger.cli(
            'Nothing to build. Please make sure you have provided a proper bunup configuration or cli arguments.',
        );
        return;
    }

    const startTime = performance.now();
    logger.cli('Build started');

    const packageJson = loadPackageJson(rootDir);
    const packageType = packageJson?.type as string | undefined;

    const externalPatterns = getExternalPatterns(options, packageJson);

    const noExternalPatterns = getNoExternalPatterns(options);

    const plugins = [externalPlugin(externalPatterns, noExternalPatterns)];

    const processableEntries = normalizeEntryToProcessableEntries(
        options.entry,
    );

    const buildPromises = options.format.flatMap(fmt =>
        processableEntries.map(entry =>
            buildEntry(options, rootDir, entry, fmt, packageType, plugins),
        ),
    );

    try {
        await Promise.all(buildPromises);

        const buildTimeMs = performance.now() - startTime;
        const timeDisplay = formatTime(buildTimeMs);
        logger.cli(`⚡ Build success in ${timeDisplay}`);
    } catch (error) {
        logger.error('Build process encountered errors.');
        process.exit(1);
    }

    if (options.dts) {
        const dtsStartTime = performance.now();
        logger.progress('DTS', 'Bundling types');

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

        const dtsWorker = new DtsWorker();
        try {
            const dtsPromises = formatsToProcess.flatMap(fmt =>
                dtsEntry.map(entry =>
                    generateDtsForEntry(
                        options,
                        rootDir,
                        entry,
                        fmt,
                        packageType,
                        dtsWorker,
                    ),
                ),
            );

            await Promise.all(dtsPromises);

            const dtsTimeMs = performance.now() - dtsStartTime;
            const dtsTimeDisplay = formatTime(dtsTimeMs);
            logger.progress('DTS', `Bundled types in ${dtsTimeDisplay}`);
        } catch (error) {
            await dtsWorker.cleanup();
        }

        await dtsWorker.cleanup();
    }
}

async function generateDtsForEntry(
    options: BunupOptions,
    rootDir: string,
    entry: ProcessableEntry,
    fmt: Format,
    packageType: string | undefined,
    dtsWorker: DtsWorker,
): Promise<void> {
    const task: DtsWorkerMessageEventData = {
        name: options.name,
        rootDir,
        outDir: options.outDir,
        entry,
        format: fmt,
        packageType,
        options,
    };

    await dtsWorker.process(task);
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
    });

    if (!result.success) {
        result.logs.forEach(log => {
            if (log.level === 'error') logger.error(log.message);
            else if (log.level === 'warning') logger.warn(log.message);
            else if (log.level === 'info') logger.info(log.message);
        });
        throw new Error(`Build failed for ${entry} (${fmt})`);
    }

    logger.progress(
        getLoggerProgressLabel(fmt, options.name),
        `${options.outDir}/${entry.name}${extension}`,
    );
}
