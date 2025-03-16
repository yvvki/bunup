#!/usr/bin/env bun
import {build} from './build';
import {parseCliOptions} from './cli-parse';
import {handleError} from './errors';
import {loadConfigs} from './loaders';
import {BunupOptions, DEFAULT_OPTIONS} from './options';

import './runtime';

import {watch} from './watch';

export async function main(args: string[] = Bun.argv.slice(2)) {
    const cliOptions = parseCliOptions(args);

    const configs = await loadConfigs(process.cwd());

    if (configs.length === 0) {
        const mergedOptions = {
            ...DEFAULT_OPTIONS,
            ...cliOptions,
        } as BunupOptions;
        await handleBuild(mergedOptions, process.cwd());
    } else {
        for (const {options, rootDir} of configs) {
            const mergedOptions = {
                ...DEFAULT_OPTIONS,
                ...options,
                ...cliOptions,
            };
            await handleBuild(mergedOptions, rootDir);
        }
    }
}

async function handleBuild(options: BunupOptions, rootDir: string) {
    if (options.watch) {
        await watch(options, rootDir);
    } else {
        await build(options, rootDir);
        process.exit(0);
    }
}

main().catch(error => {
    handleError(error);
    process.exit(1);
});
