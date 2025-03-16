import fs from 'fs';
import path from 'path';

import {DtsWorker, DtsWorkerMessageEventData} from './dts/worker';
import {loadPackageJson} from './loaders';
import {logger} from './logger';
import {BunupOptions, createBunBuildOptions, Format} from './options';
import {
    formatTime,
    getBunupTempDir,
    getDefaultOutputExtension,
    getDtsTempDir,
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

    if (options.clean) cleanOutputDir(rootDir, options.outDir);

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

    cleanupTempDir(rootDir, options.outDir);
}

function cleanupTempDir(rootDir: string, outdir: string): void {
    const bunupTempDir = getBunupTempDir(rootDir, outdir);
    if (fs.existsSync(bunupTempDir)) {
        fs.rmSync(bunupTempDir, {recursive: true, force: true});
    }
}

async function generateDtsForEntry(
    options: BunupOptions,
    rootDir: string,
    entry: string,
    fmt: Format,
    packageType: string | undefined,
    dtsOptions: any,
    dtsWorker: DtsWorker,
): Promise<void> {
    const dtsTempDir = getDtsTempDir(getEntryNameOnly(entry), fmt);
    const task: DtsWorkerMessageEventData = {
        rootDir,
        outDir: options.outDir,
        entry,
        dtsTempDir,
        format: fmt,
        packageType,
        dtsOptions,
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
        throw: false,
    });

    const name = getEntryNameOnly(entry);

    if (!result.success) {
        result.logs.forEach(log => {
            if (log.level === 'error') logger.error(log.message);
            else if (log.level === 'warning') logger.warn(log.message);
            else if (log.level === 'info') logger.info(log.message);
        });
        throw new Error(`Build failed for ${entry} (${fmt})`);
    }

    logger.progress(fmt.toUpperCase(), `${options.outDir}/${name}${extension}`);
}

function cleanOutputDir(rootDir: string, outdir: string): void {
    const outdirPath = path.join(rootDir, outdir);
    if (fs.existsSync(outdirPath)) {
        try {
            fs.rmSync(outdirPath, {recursive: true, force: true});
        } catch (error) {
            logger.error(`Failed to clean output directory: ${error}`);
        }
    }
    fs.mkdirSync(outdirPath, {recursive: true});
}
