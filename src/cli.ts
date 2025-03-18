#!/usr/bin/env bun
import fs from 'fs';
import path from 'path';

import {build} from './build';
import {parseCliOptions} from './cli-parse';
import {handleError} from './errors';
import {loadConfigs} from './loaders';
import {logger} from './logger';
import {BunupOptions, DEFAULT_OPTIONS} from './options';

import './runtime';

import {watch} from './watch';

async function main(args: string[] = Bun.argv.slice(2)) {
    const cliOptions = parseCliOptions(args);
    const configs = await loadConfigs(process.cwd());
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

        if (mergedOptions.clean) cleanOutDir(rootDir, mergedOptions.outDir);

        await handleBuild(mergedOptions, rootDir);
    } else {
        for (const {options, rootDir} of configs) {
            if (options.clean) cleanOutDir(rootDir, options.outDir);
        }

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

    if (!cliOptions.watch) {
        process.exit(0);
    }
}

async function handleBuild(options: BunupOptions, rootDir: string) {
    if (options.watch) {
        await watch(options, rootDir);
    } else {
        await build(options, rootDir);
    }
}

function cleanOutDir(rootDir: string, outdir: string): void {
    const outdirPath = path.join(rootDir, outdir);
    if (fs.existsSync(outdirPath)) {
        try {
            fs.rmSync(outdirPath, {recursive: true, force: true});
        } catch (error) {
            logger.error(`Failed to clean output directory: ${error}`);
        }
    }
    fs.mkdirSync(outdirPath, {recursive: true});
}

main().catch(error => {
    handleError(error);
    process.exit(1);
});
