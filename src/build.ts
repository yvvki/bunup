import { dts } from './dts';
import {logger} from './logger';
import {BunupOptions, createBuildOptions} from './options';
import {getDefaultExtension, getEntryName} from './utils';

/**
 * Build the project, optionally generating a consolidated `.d.ts` file.
 * @param options - Build options.
 * @param rootDir - Root directory of the project.
 * @param watch - Whether to run in watch mode.
 */
export async function build(
    options: BunupOptions,
    rootDir: string,
    watch: boolean = false,
) {
    logger.cli('Build started');
    const startTime = performance.now();

    const buildOptions = createBuildOptions(options, rootDir);

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
        for (const fmt of options.format) {
            for (const entry of options.entry) {
                const extension = getDefaultExtension(fmt);

                const result = await Bun.build({
                    ...buildOptions,
                    entrypoints: [`${rootDir}/${entry}`],
                    format: fmt,
                    naming: {
                        entry: `[dir]/[name]${extension}`,
                    },
                    plugins: [dts()],
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
    }
}
