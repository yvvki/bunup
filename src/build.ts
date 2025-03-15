import fs from 'fs';
import path from 'path';

import {generateDts} from './dts';
import {loadPackageJson} from './loaders';
import {logger} from './logger';
import {BunupOptions, createBunBuildOptions, Format} from './options';
import {
    formatTime,
    getBunupTempDir,
    getDefaultDtsExtention,
    getDefaultOutputExtension,
    getDtsTempDir,
    getEntryName,
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

    setupDirectories(rootDir, options.outDir);

    if (options.watch) {
        watchMode(options, rootDir);
    } else {
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
        } catch (error) {
            logger.error('Build process encountered errors.');
            process.exit(1);
        }

        const buildTimeMs = performance.now() - startTime;
        const timeDisplay = formatTime(buildTimeMs);
        logger.cli(`⚡ Build success in ${timeDisplay}`);

        if (options.dts) {
            const dtsStartTime = performance.now();
            logger.progress('DTS', 'Bundling types');

            const dtsOptions =
                typeof options.dts === 'object' ? options.dts : {};
            const entries = dtsOptions.entry || options.entry;

            // Skip IIFE types when using CJS format in non-module packages (they would be identical)
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

            const dtsPromises = formatsToProcess.flatMap(fmt =>
                entries.map(entry =>
                    generateDtsForEntry(
                        options,
                        rootDir,
                        entry,
                        fmt,
                        packageType,
                        dtsOptions,
                    ),
                ),
            );
            try {
                await Promise.all(dtsPromises);
            } catch (error) {
                logger.warn('DTS bundling encountered errors.');
            }

            const dtsTimeMs = performance.now() - dtsStartTime;
            const dtsTimeDisplay = formatTime(dtsTimeMs);
            logger.progress('DTS', `Bundled types in ${dtsTimeDisplay}`);
        }

        cleanupTempDir(rootDir, options.outDir);
    }
}

function cleanupTempDir(rootDir: string, outdir: string): void {
    const bunupTempDir = getBunupTempDir(rootDir, outdir);
    if (fs.existsSync(bunupTempDir)) {
        fs.rmSync(bunupTempDir, {recursive: true, force: true});
    }
}

function watchMode(options: BunupOptions, rootDir: string): void {
    logger.cli('Running in watch mode\n');
    const bunBuildOptions = createBunBuildOptions(options, rootDir);
    Bun.spawn(
        [
            'bun',
            'build',
            ...(bunBuildOptions.entrypoints || []),
            '--outdir',
            bunBuildOptions.outdir || '',
            '--watch',
        ],
        {stdout: 'inherit', stderr: 'inherit'},
    );
}

async function generateDtsForEntry(
    options: BunupOptions,
    rootDir: string,
    entry: string,
    fmt: Format,
    packageType: string | undefined,
    dtsOptions: any,
): Promise<void> {
    const name = getEntryName(entry);
    const content = await generateDts(
        rootDir,
        options.outDir,
        entry,
        getDtsTempDir(name, fmt),
        fmt,
        dtsOptions,
    );
    const extension = getDefaultDtsExtention(fmt, packageType);
    const outputPath = `${rootDir}/${options.outDir}/${name}${extension}`;
    await Bun.write(outputPath, content);
    logger.progress('DTS', `${options.outDir}/${name}${extension}`);
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
        naming: {entry: `[dir]/[name]${extension}`},
    });

    const name = getEntryName(entry);
    logger.progress(fmt.toUpperCase(), `${options.outDir}/${name}${extension}`);

    if (!result.success) {
        logger.error(`Build failed for ${entry} (${fmt}):`);
        result.logs.forEach(log => {
            if (log.level === 'error') logger.error(log.message);
            else if (log.level === 'warning') logger.warn(log.message);
            else if (log.level === 'info') logger.info(log.message);
            else console.log(log.message);
        });
        throw new Error(`Build failed for ${entry} (${fmt})`);
    }
}

function setupDirectories(rootDir: string, outdir: string): void {
    const outdirPath = path.join(rootDir, outdir);
    if (fs.existsSync(outdirPath)) {
        try {
            fs.rmSync(outdirPath, {recursive: true, force: true});
        } catch (error) {
            logger.error(`Failed to clean output directory: ${error}`);
            process.exit(1);
        }
    }
    fs.mkdirSync(outdirPath, {recursive: true});
}
