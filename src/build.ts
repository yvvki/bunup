import {generateDts} from './dts';
import {logger} from './logger';
import {BunupOptions, normalizeOptions} from './options';
import {
    getDefaultDtsExtention,
    getDefaultOutputExtension,
    getEntryName,
} from './utils';

/**
 * Builds the project based on the provided options.
 *
 * @param options - Configuration options for the build process
 * @param rootDir - The root directory of the project
 * @param watch - Whether to run in watch mode (default: false)
 * @returns A Promise that resolves when the build process completes
 */
export async function build(
    options: BunupOptions,
    rootDir: string,
    watch: boolean = false,
) {
    if (!options.entry || options.entry.length === 0) {
        logger.cli('Nothing to build. Please specify entry points');
        return;
    }

    const startTime = performance.now();

    const buildOptions = normalizeOptions(options, rootDir);

    if (watch) {
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
        for (const fmt of options.format) {
            for (const entry of options.entry) {
                const extension = getDefaultOutputExtension(fmt);

                const result = await Bun.build({
                    ...buildOptions,
                    entrypoints: [`${rootDir}/${entry}`],
                    format: fmt,
                    naming: {
                        entry: `[dir]/[name]${extension}`,
                    },
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

        logger.progress('DTS', 'Bundling types');

        if (options.dts) {
            const dtsStartTime = performance.now();
            for (const entry of options.entry) {
                for (const fmt of options.format) {
                    const content = await generateDts(
                        rootDir,
                        entry,
                        `${rootDir}/${options.outdir}/.bunup`,
                        fmt,
                    );

                    const name = getEntryName(entry);
                    const extension = getDefaultDtsExtention(fmt);
                    const outputPath = `${rootDir}/${options.outdir}/${name}${extension}`;
                    await Bun.write(outputPath, content);
                    logger.progress(
                        'DTS',
                        `${options.outdir}/${name}${extension}`,
                    );
                }
            }
            const dtsEndTime = performance.now();
            const dtsTimeMs = dtsEndTime - dtsStartTime;
            const dtsTimeDisplay =
                dtsTimeMs >= 1000
                    ? `${(dtsTimeMs / 1000).toFixed(2)}s`
                    : `${Math.round(dtsTimeMs)}ms`;

            logger.progress(
                'DTS',
                `Bundling types success in ${dtsTimeDisplay}`,
            );
        }
    }
}
