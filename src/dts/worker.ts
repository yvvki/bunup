import {
    isMainThread,
    parentPort,
    Worker,
    workerData,
} from 'node:worker_threads';

import {allFilesUsedToBundleDts} from '../cli';
import {BunupDTSBuildError, parseErrorMessage} from '../errors';
import {ProcessableEntry} from '../helpers/entry';
import {logger} from '../logger';
import {BunupOptions, Format} from '../options';
import {formatTime, getDefaultDtsExtention} from '../utils';
import {generateDts} from './index';

// Global variable to share between main and worker threads
declare global {
    // eslint-disable-next-line no-var
    var allFilesUsedToBundleDts: Set<string> | undefined;
}

interface DtsWorkerData {
    rootDir: string;
    entries: ProcessableEntry[];
    formats: Format[];
    options: BunupOptions;
    packageType: string | undefined;
}

interface DtsWorkerResult {
    success: boolean;
    timeMs: number;
    error?: string;
    filesUsed?: string[];
}

export async function runDtsInWorker(
    rootDir: string,
    entries: ProcessableEntry[],
    formats: Format[],
    options: BunupOptions,
    packageType: string | undefined,
): Promise<void> {
    return new Promise((resolve, reject) => {
        // Create a copy of options without the onBuildEnd function to avoid 'The object can not be cloned' error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {onBuildEnd, ...optionsWithoutCallbacks} = options;

        const workerData: DtsWorkerData = {
            rootDir,
            entries,
            formats,
            options: optionsWithoutCallbacks,
            packageType,
        };

        const worker = new Worker(new URL('./dtsWorker.js', import.meta.url), {
            workerData,
        });

        worker.on('message', async (result: DtsWorkerResult) => {
            if (result.success) {
                const timeDisplay = formatTime(result.timeMs);
                logger.progress('DTS', `Bundled types in ${timeDisplay}`);

                // Add the files used in worker to the main thread's set
                if (result.filesUsed) {
                    result.filesUsed.forEach(file =>
                        allFilesUsedToBundleDts.add(file),
                    );
                }

                resolve();
            } else {
                reject(
                    new BunupDTSBuildError(
                        result.error || 'Unknown DTS worker error',
                    ),
                );
            }
        });

        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0) {
                reject(
                    new BunupDTSBuildError(
                        `DTS worker stopped with exit code ${code}`,
                    ),
                );
            }
        });
    });
}
if (!isMainThread && parentPort) {
    const {rootDir, entries, formats, options, packageType} =
        workerData as DtsWorkerData;

    const startTime = performance.now();
    const workerFilesUsed = new Set<string>();

    // Replace the imported allFilesUsedToBundleDts with our local version
    global.allFilesUsedToBundleDts = workerFilesUsed;

    logger.progress('DTS', 'Bundling types');

    try {
        (async () => {
            try {
                await Promise.all(
                    entries.map(async entry => {
                        const content = await generateDts(
                            rootDir,
                            entry.path,
                            options,
                        );

                        await Promise.all(
                            formats.map(async fmt => {
                                const extension = getDefaultDtsExtention(
                                    fmt,
                                    packageType,
                                );
                                const outputRelativePath = `${options.outDir}/${entry.name}${extension}`;
                                const outputPath = `${rootDir}/${outputRelativePath}`;

                                await Bun.write(outputPath, content);

                                logger.progress(`DTS`, outputRelativePath);
                            }),
                        );
                    }),
                );

                const timeMs = performance.now() - startTime;
                parentPort?.postMessage({
                    success: true,
                    timeMs,
                    filesUsed: [...workerFilesUsed],
                });
            } catch (error) {
                parentPort?.postMessage({
                    success: false,
                    error: parseErrorMessage(error),
                });
            }
        })();
    } catch (error) {
        parentPort?.postMessage({
            success: false,
            error: parseErrorMessage(error),
        });
    }
}
