#!/usr/bin/env bun
import {build} from './build';
import {parseCliOptions} from './cli-parse';
import {handleError} from './errors';
import {loadConfigs} from './loaders';
import {BunupOptions, DEFAULT_OPTIONS} from './options';

import './runtime';

export async function main(args: string[] = Bun.argv.slice(2)) {
    const cliOptions = parseCliOptions(args);

    const configs = await loadConfigs(process.cwd());

    if (configs.length === 0) {
        const mergedConfig = {
            ...DEFAULT_OPTIONS,
            ...cliOptions,
        } as BunupOptions;
        await build(mergedConfig, process.cwd());
    } else {
        for (const {options, rootDir} of configs) {
            const mergedConfig = {
                ...DEFAULT_OPTIONS,
                ...options,
                ...cliOptions,
            };
            await build(mergedConfig, rootDir);
        }
    }
}

main().catch(error => {
    handleError(error);
    process.exit(1);
});
