import fs from 'node:fs';
import path from 'node:path';

import {generateDts} from './dts';
import {loadPackageJson} from './loaders';
import {logger} from './logger';
import {BunupOptions, normalizeOptions} from './options';
import {
    getBunupTempDir,
    getDefaultDtsExtention,
    getDefaultOutputExtension,
    getDtsTempDir,
    getEntryName,
} from './utils';

export async function build(options: BunupOptions, rootDir: string) {
    if (!options.entry || options.entry.length === 0 || !options.outdir) {
        logger.cli(
            'Nothing to build. Please make sure you have provided a proper bunup configuration or cli arguments.',
        );
        return;
    }

    const startTime = performance.now();

    const buildOptions = normalizeOptions(options, rootDir);

    const outdirPath = path.join(rootDir, options.outdir);
    if (fs.existsSync(outdirPath)) {
        try {
            fs.rmSync(outdirPath, {recursive: true, force: true});
            fs.mkdirSync(outdirPath, {recursive: true});
        } catch (error) {
            logger.error(`Failed to clean output directory: ${error}`);
        }
    } else {
        fs.mkdirSync(outdirPath, {recursive: true});
    }

    if (options.watch) {
        logger.cli('Running in watch mode\n');
        Bun.spawn(
            [
                'bun',
                'build',
                ...(buildOptions.entrypoints || []),
                '--outdir',
                buildOptions.outdir || '',
                '--watch',
            ],
            {
                stdout: 'inherit',
                stderr: 'inherit',
            },
        );
    } else {
        logger.cli('Build started');

        const packageJson = await loadPackageJson(rootDir);
        const packageType = packageJson?.type;

        for (const fmt of options.format) {
            for (const entry of options.entry) {
                const extension = getDefaultOutputExtension(fmt, packageType);

                const result = await Bun.build({
                    ...buildOptions,
                    entrypoints: [`${rootDir}/${entry}`],
                    format: fmt,
                    naming: {
                        entry: `[dir]/[name]${extension}`,
                    },
                    throw: false,
                });

                const name = getEntryName(entry);

                logger.progress(
                    fmt.toUpperCase(),
                    `${options.outdir}/${name}${extension}`,
                );

                if (!result.success) {
                    logger.error(`Build failed for ${entry}:`);
                    result.logs.forEach(log => {
                        if (log.level === 'error') {
                            logger.error(log.message);
                        } else if (log.level === 'warning') {
                            logger.warn(log.message);
                        } else if (log.level === 'info') {
                            logger.info(log.message);
                        } else {
                            console.log(log.message);
                        }
                    });
                    process.exit(1);
                }
            }
        }

        const endTime = performance.now();
        const buildTimeMs = endTime - startTime;
        const timeDisplay =
            buildTimeMs >= 1000
                ? `${(buildTimeMs / 1000).toFixed(2)}s`
                : `${Math.round(buildTimeMs)}ms`;

        logger.cli(`⚡ Build success in ${timeDisplay}`);

        if (options.dts) {
            const dtsStartTime = performance.now();
            logger.progress('DTS', 'Bundling types');

            const dtsOptions =
                typeof options.dts === 'object' ? options.dts : {};
            const entries = dtsOptions.entry || options.entry;

            const dtsPromises = [];

            for (const entry of entries) {
                for (const fmt of options.format) {
                    const promise = (async () => {
                        try {
                            const name = getEntryName(entry);
                            const content = await generateDts(
                                rootDir,
                                options.outdir!,
                                entry,
                                getDtsTempDir(name, fmt),
                                fmt,
                                dtsOptions,
                            );
                            const extension = getDefaultDtsExtention(
                                fmt,
                                packageType,
                            );
                            const outputPath = `${rootDir}/${options.outdir}/${name}${extension}`;
                            await Bun.write(outputPath, content);
                            logger.progress(
                                'DTS',
                                `${options.outdir}/${name}${extension}`,
                            );
                            return {success: true, entry, format: fmt};
                        } catch (error) {
                            logger.error(
                                `Failed to generate DTS for ${entry} (${fmt}): ${error}`,
                            );
                            return {success: false, entry, format: fmt, error};
                        }
                    })();
                    dtsPromises.push(promise);
                }
            }

            const results = await Promise.all(dtsPromises);
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            const dtsEndTime = performance.now();
            const dtsTimeMs = dtsEndTime - dtsStartTime;
            const dtsTimeDisplay =
                dtsTimeMs >= 1000
                    ? `${(dtsTimeMs / 1000).toFixed(2)}s`
                    : `${Math.round(dtsTimeMs)}ms`;

            if (failed > 0) {
                logger.warn(
                    `DTS bundling completed with ${failed} errors and ${successful} successes in ${dtsTimeDisplay}`,
                );
            } else {
                logger.progress(
                    'DTS',
                    `Bundling types success in ${dtsTimeDisplay}`,
                );
            }
        }

        const bunupTempDir = getBunupTempDir(rootDir, options.outdir!);
        if (fs.existsSync(bunupTempDir)) {
            fs.rmSync(bunupTempDir, {recursive: true, force: true});
        }
    }
}
