import {
    isMainThread,
    parentPort,
    Worker,
    workerData,
} from 'node:worker_threads';

import {BunupDTSBuildError, parseErrorMessage} from '../errors';
import {ProcessableEntry} from '../helpers/entry';
import {logger} from '../logger';
import {BunupOptions, Format} from '../options';
import {formatTime, getDefaultDtsExtention} from '../utils';
import {reportedDtsErrors} from './generator';
import {generateDts} from './index';

interface DtsWorkerData {
    rootDir: string;
    entries: ProcessableEntry[];
    formats: Format[];
    options: BunupOptions;
    packageType: string | undefined;
}

interface DtsWorkerResult {
    success: boolean;
    error?: string;
}

export async function runDtsInWorker(
    rootDir: string,
    entries: ProcessableEntry[],
    formats: Format[],
    options: BunupOptions,
    packageType: string | undefined,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const workerData: DtsWorkerData = {
            rootDir,
            entries,
            formats,
            options,
            packageType,
        };

        const worker = new Worker(new URL('./dtsWorker.js', import.meta.url), {
            workerData,
        });

        worker.on('message', (result: DtsWorkerResult) => {
            if (result.success) {
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

    logger.progress('DTS', 'Bundling types');

    try {
        const dtsPromises = entries.map(async entry => {
            const content = await generateDts(rootDir, entry.path, options);

            return Promise.all(
                formats.map(async fmt => {
                    const extension = getDefaultDtsExtention(fmt, packageType);
                    const outputRelativePath = `${options.outDir}/${entry.name}${extension}`;
                    const outputPath = `${rootDir}/${outputRelativePath}`;

                    await Bun.write(outputPath, content);

                    logger.progress(`DTS`, outputRelativePath);
                }),
            );
        });

        Promise.all(dtsPromises)
            .then(() => {
                const timeMs = performance.now() - startTime;
                parentPort?.postMessage({success: true});

                const timeDisplay = formatTime(timeMs);
                logger.progress('DTS', `Bundled types in ${timeDisplay}`);

                if (reportedDtsErrors.size > 0) {
                    console.log('\n');

                    reportedDtsErrors.forEach(errorMessage => {
                        logger.warn(errorMessage);
                    });

                    logger.info(
                        '\nYou may have noticed some TypeScript warnings above related to missing type annotations. ' +
                            'This is because Bunup uses TypeScript\'s "isolatedDeclarations" approach for generating declaration files. ' +
                            'This modern approach requires explicit type annotations on exports for better, more accurate type declarations. ' +
                            'Other bundlers might not show these warnings because they use different, potentially less precise methods. ' +
                            'Adding the suggested type annotations will not only silence these warnings but also improve the quality ' +
                            'of your published type definitions, making your library more reliable for consumers.\n',
                    );

                    reportedDtsErrors.clear();
                }
            })
            .catch(error => {
                parentPort?.postMessage({
                    success: false,
                    error: parseErrorMessage(error),
                });
            });
    } catch (error) {
        parentPort?.postMessage({
            success: false,
            error: parseErrorMessage(error),
        });
    }
}
