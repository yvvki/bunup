#!/usr/bin/env bun
import fs from 'node:fs';
import path from 'node:path';
import {isMainThread} from 'node:worker_threads';

import {build} from './build';
import {parseCliOptions} from './cli-parse';
import {BunupBuildError, handleErrorAndExit} from './errors';
import {loadConfigs} from './loaders';
import {logger} from './logger';
import {BunupOptions, DEFAULT_OPTIONS} from './options';

import './runtime';

import {validateFilesUsedToBundleDts} from './dts/validation';
import {getShortFilePath} from './utils';
import {watch} from './watch';

export const allFilesUsedToBundleDts = new Set<string>();

export async function main(args: string[] = Bun.argv.slice(2)) {
        const cliOptions = parseCliOptions(args);
        const {configs, configFilePath} = await loadConfigs(process.cwd());

        logger.cli(`Using config file: ${getShortFilePath(configFilePath, 2)}`);

        const rootDir = process.cwd();

        if (cliOptions.watch) {
                logger.cli('Starting watch mode');
                logger.cli(`Watching for file changes`);
        }

        if (configs.length === 0) {
                const mergedOptions = {
                        ...DEFAULT_OPTIONS,
                        ...cliOptions,
                } as BunupOptions;

                if (mergedOptions.clean)
                        cleanOutDir(rootDir, mergedOptions.outDir);

                await handleBuild(mergedOptions, rootDir);
        } else {
                for (const {options, rootDir} of configs) {
                        if (options.clean) cleanOutDir(rootDir, options.outDir);
                }

                logger.cli('Build started');

                await Promise.all(
                        configs.map(async ({options, rootDir}) => {
                                const mergedOptions = {
                                        ...DEFAULT_OPTIONS,
                                        ...options,
                                        ...cliOptions,
                                };
                                await handleBuild(mergedOptions, rootDir);
                        }),
                );
        }

        // Validate all ts files used to bundle DTS after all builds complete
        if (allFilesUsedToBundleDts.size > 0) {
                await validateFilesUsedToBundleDts(allFilesUsedToBundleDts);
                allFilesUsedToBundleDts.clear();
        }

        if (!cliOptions.watch) {
                process.exit(0);
        }
}

async function handleBuild(options: BunupOptions, rootDir: string) {
        if (options.watch) {
                await watch(options, rootDir);
        } else {
                await build(options, rootDir);
                options.onBuildEnd?.();
        }
}

function cleanOutDir(rootDir: string, outdir: string): void {
        const outdirPath = path.join(rootDir, outdir);
        if (fs.existsSync(outdirPath)) {
                try {
                        fs.rmSync(outdirPath, {recursive: true, force: true});
                } catch (error) {
                        throw new BunupBuildError(
                                `Failed to clean output directory: ${error}`,
                        );
                }
        }
        fs.mkdirSync(outdirPath, {recursive: true});
}

// Only run main() in the main thread, not when imported in worker threads
if (isMainThread) {
        main().catch(error => handleErrorAndExit(error));
}
