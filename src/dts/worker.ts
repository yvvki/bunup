import path from 'path';

import {generateDts} from '.';
import {parseErrorMessage} from '../errors';
import {getLoggerProgressLabel, logger} from '../logger';
import {BunupOptions, DtsOptions, Format} from '../options';
import {getDefaultDtsExtention, getEntryNameOnly} from '../utils';

export type DtsWorkerMessageEventData = {
    name: string | undefined;
    rootDir: string;
    outDir: string;
    entry: string;
    format: Format;
    packageType: string | undefined;
    dtsOptions: DtsOptions;
    options: BunupOptions;
};

export type DtsWorkerResponse =
    | {
          name: string | undefined;
          success: true;
          outputRelativePath: string;
      }
    | {
          success: false;
          error: string;
      };

self.onmessage = async (event: MessageEvent<DtsWorkerMessageEventData>) => {
    const {
        name,
        rootDir,
        outDir,
        entry,
        format,
        packageType,
        dtsOptions,
        options,
    } = event.data;

    try {
        const content = await generateDts(
            rootDir,
            entry,
            format,
            options,
            dtsOptions,
        );

        const entryName = getEntryNameOnly(entry);
        const extension = getDefaultDtsExtention(format, packageType);
        const outputRelativePath = `${outDir}/${entryName}${extension}`;
        const outputPath = `${rootDir}/${outputRelativePath}`;

        await Bun.write(outputPath, content);

        const response: DtsWorkerResponse = {
            name,
            success: true,
            outputRelativePath,
        };
        self.postMessage(response);
    } catch (error) {
        const response: DtsWorkerResponse = {
            success: false,
            error: parseErrorMessage(error),
        };
        self.postMessage(response);
    }
};

export class DtsWorker {
    private workers: Worker[] = [];
    private queue: Array<{
        task: DtsWorkerMessageEventData;
        resolve: (value: void) => void;
        reject: (reason: any) => void;
    }> = [];
    private readonly maxWorkers: number;
    private busyWorkers = new Set<Worker>();
    private isShuttingDown = false;

    constructor(maxWorkers = navigator.hardwareConcurrency || 4) {
        this.maxWorkers = maxWorkers;
    }

    async process(task: DtsWorkerMessageEventData): Promise<void> {
        if (this.isShuttingDown) {
            throw new Error('Worker pool is shutting down');
        }

        return new Promise((resolve, reject) => {
            this.queue.push({task, resolve, reject});
            this.processQueue();
        });
    }

    private processQueue(): void {
        if (this.queue.length === 0 || this.isShuttingDown) return;

        if (this.workers.length < this.maxWorkers) {
            const worker = new Worker(path.join(__dirname, './dtsWorker.js'));
            this.workers.push(worker);
            this.assignTaskToWorker(worker);
        } else {
            const availableWorker = this.workers.find(
                w => !this.busyWorkers.has(w),
            );
            if (availableWorker) {
                this.assignTaskToWorker(availableWorker);
            }
        }
    }

    private assignTaskToWorker(worker: Worker): void {
        const queueItem = this.queue.shift();
        if (!queueItem) return;

        const {task, resolve, reject} = queueItem;
        this.busyWorkers.add(worker);

        const cleanup = () => {
            this.busyWorkers.delete(worker);
            if (this.isShuttingDown && this.busyWorkers.size === 0) {
                this.terminateAllWorkers();
            } else {
                this.processQueue();
            }
        };

        worker.onmessage = (event: MessageEvent<DtsWorkerResponse>) => {
            if (event.data.success) {
                logger.progress(
                    getLoggerProgressLabel('DTS', event.data.name),
                    event.data.outputRelativePath,
                );
                resolve();
            } else {
                logger.error(`DTS generation failed: ${event.data.error}`);
                reject(new Error(event.data.error));
            }
            cleanup();
        };

        worker.onerror = (error: unknown) => {
            const errorMessage = parseErrorMessage(error);
            logger.error(`Worker error: ${errorMessage}`);
            reject(error);
            cleanup();
        };

        worker.postMessage(task);
    }

    private terminateAllWorkers(): void {
        this.workers.forEach(worker => {
            try {
                worker.terminate();
            } catch (error) {
                logger.error(
                    `Error terminating worker: ${parseErrorMessage(error)}`,
                );
            }
        });
        this.workers = [];
        this.busyWorkers.clear();
    }

    async cleanup(): Promise<void> {
        this.isShuttingDown = true;

        if (this.busyWorkers.size === 0) {
            this.terminateAllWorkers();
            return;
        }

        return new Promise<void>(resolve => {
            const checkInterval = setInterval(() => {
                if (this.busyWorkers.size === 0) {
                    clearInterval(checkInterval);
                    this.terminateAllWorkers();
                    resolve();
                }
            }, 100);

            setTimeout(() => {
                clearInterval(checkInterval);
                this.terminateAllWorkers();
                resolve();
            }, 5000);
        });
    }
}
