import path from "node:path";

import chokidar from "chokidar";

import { build } from "./build";
import { validateDtsFiles } from "./cli";
import { BunupWatchError, handleError, parseErrorMessage } from "./errors";
import { normalizeEntryToProcessableEntries } from "./helpers/entry";
import { logger } from "./logger";
import type { BunupOptions } from "./options";
import { formatTime } from "./utils";

export async function watch(
    options: BunupOptions,
    rootDir: string,
): Promise<void> {
    const watchPaths = new Set<string>();

    const normalizedEntry = normalizeEntryToProcessableEntries(options.entry);

    for (const entry of normalizedEntry) {
        const entryPath = path.resolve(rootDir, entry.path);
        const parentDir = path.dirname(entryPath);
        watchPaths.add(parentDir);
    }

    const watcher = chokidar.watch(Array.from(watchPaths), {
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50,
        },
        ignoreInitial: true,
        atomic: true,
        ignorePermissionErrors: true,
        ignored: [
            /[\\/]\.git[\\/]/,
            /[\\/]node_modules[\\/]/,
            path.join(rootDir, options.outDir),
        ],
    });

    let isRebuilding = false;

    const triggerRebuild = async (initial = false) => {
        if (isRebuilding) return;
        isRebuilding = true;
        try {
            const start = performance.now();
            await build(
                {
                    ...options,
                    entry: normalizedEntry.map((entry) => entry.path),
                    clean: false,
                },
                rootDir,
            );
            options.onBuildSuccess?.();
            if (!initial) {
                logger.cli(
                    `📦 Rebuild finished in ${formatTime(performance.now() - start)}`,
                );
            }
            await validateDtsFiles();
        } catch (error) {
            handleError(error);
        } finally {
            isRebuilding = false;
        }
    };

    watcher.on("change", (filePath) => {
        const changedFile = path.relative(rootDir, filePath);
        logger.cli(`File changed: ${changedFile}`, {
            muted: true,
        });
        triggerRebuild();
    });

    watcher.on("error", (error) => {
        throw new BunupWatchError(`Watcher error: ${parseErrorMessage(error)}`);
    });

    await triggerRebuild(true);
}
