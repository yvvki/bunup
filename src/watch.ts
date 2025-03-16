import path from 'path';

import chokidar from 'chokidar';

import {build} from './build';
import {logger} from './logger';
import {BunupOptions} from './options';

export async function watch(
    options: BunupOptions,
    rootDir: string,
): Promise<void> {
    logger.cli('Starting watch mode');

    const watchPaths = new Set<string>();

    options.entry.forEach(entry => {
        const entryPath = path.resolve(rootDir, entry);
        const parentDir = path.dirname(entryPath);
        watchPaths.add(parentDir);
    });

    const watcher = chokidar.watch(Array.from(watchPaths), {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50,
        },
        atomic: true,
    });

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let isRebuilding = false;

    const triggerRebuild = async (changedFile: string) => {
        if (isRebuilding) return;
        isRebuilding = true;
        try {
            await build(
                {
                    ...options,
                    entry: [changedFile],
                    clean: false,
                },
                rootDir,
            );
        } catch (error) {
            logger.error(`Build failed: ${error}`);
        } finally {
            isRebuilding = false;
        }
    };

    watcher.on('change', filePath => {
        const changedFile = path.relative(rootDir, filePath);
        logger.cli(`File changed: ${changedFile}`);
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => triggerRebuild(changedFile), 300);
    });

    watcher.on('ready', () => {
        logger.cli('Watching for file changes\n');
    });

    watcher.on('error', error => {
        logger.error(`Watcher error: ${error}`);
    });
}
