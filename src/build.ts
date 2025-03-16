import {DtsWorker, DtsWorkerMessageEventData} from './dts/worker';
import {loadPackageJson} from './loaders';
import {getLoggerProgressLabel, logger} from './logger';
import {
    BunupOptions,
    createBunBuildOptions,
    DtsOptions,
    Format,
} from './options';
import {
    formatTime,
    getDefaultOutputExtension,
    getEntryNameOnly,
    getEntryNamingFormat,
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

    const packageJson = await loadPackageJson(rootDir);
    const packageType = packageJson?.type;

    const buildPromises = options.format.flatMap(fmt =>
        options.entry.map(entry =>
            buildEntry(options, rootDir, entry, fmt, packageType),
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

        const dtsOptions = typeof options.dts === 'object' ? options.dts : {};
        const entries = dtsOptions.entry || options.entry;

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

        const dtsWorker = new DtsWorker();
        try {
            const dtsPromises = formatsToProcess.flatMap(fmt =>
                entries.map(entry =>
                    generateDtsForEntry(
                        options,
                        rootDir,
                        entry,
                        fmt,
                        packageType,
                        dtsOptions,
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
    entry: string,
    fmt: Format,
    packageType: string | undefined,
    dtsOptions: DtsOptions,
    dtsWorker: DtsWorker,
): Promise<void> {
    const task: DtsWorkerMessageEventData = {
        name: options.name,
        rootDir,
        outDir: options.outDir,
        entry,
        format: fmt,
        packageType,
        dtsOptions,
        options,
    };

    await dtsWorker.process(task);
}

async function buildEntry(
    options: BunupOptions,
    rootDir: string,
    entry: string,
    fmt: Format,
    packageType: string | undefined,
): Promise<void> {
    const extension = getDefaultOutputExtension(fmt, packageType);
    const bunBuildOptions = createBunBuildOptions(options, rootDir);
    const result = await Bun.build({
        ...bunBuildOptions,
        entrypoints: [`${rootDir}/${entry}`],
        format: fmt,
        naming: {entry: getEntryNamingFormat(extension)},
    });

    const entryName = getEntryNameOnly(entry);

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
        `${options.outDir}/${entryName}${extension}`,
    );
}
