import path from 'path';

import chokidar from 'chokidar';

import {build} from './build';
import {normalizeEntryToProcessableEntries} from './helpers/entry';
import {logger} from './logger';
import {BunupOptions} from './options';

export async function watch(
    options: BunupOptions,
    rootDir: string,
): Promise<void> {
    const watchPaths = new Set<string>();

    const normalizedEntry = normalizeEntryToProcessableEntries(options.entry);

    normalizedEntry.forEach(entry => {
        const entryPath = path.resolve(rootDir, entry.path);
        const parentDir = path.dirname(entryPath);
        watchPaths.add(parentDir);
    });

    const watcher = chokidar.watch(Array.from(watchPaths), {
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50,
        },
        atomic: true,
        ignorePermissionErrors: true,
        ignored: [/[\\/]\.git[\\/]/, /[\\/]node_modules[\\/]/, options.outDir],
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

    watcher.on('error', error => {
        logger.error(`Watcher error: ${error}`);
    });
}
