#!/usr/bin/env bun
import { allFilesUsedToBundleDts, build } from "./build";
import { parseCliOptions } from "./cli-parse";
import { handleErrorAndExit } from "./errors";
import { logger, setSilent } from "./logger";
import { type BuildOptions, DEFAULT_OPTIONS } from "./options";

import "./runtime";

import type { DefineConfigEntry, DefineWorkspaceEntry } from "bunup";
import { loadConfig } from "coffi";
import { version } from "../package.json";
import { validateFilesUsedToBundleDts } from "./dts/validation";
import { type ProcessableConfig, processLoadedConfigs } from "./loaders";
import type { Arrayable } from "./types";
import {
    cleanOutDir,
    ensureArray,
    formatTime,
    getResolvedClean,
    getResolvedOutDir,
    getShortFilePath,
} from "./utils";
import { watch } from "./watch";

export type LoadedConfig = Arrayable<DefineConfigEntry | DefineWorkspaceEntry>;

export async function main(args: string[] = Bun.argv.slice(2)): Promise<void> {
    const cliOptions = parseCliOptions(args);

    setSilent(cliOptions.silent);

    const cwd = process.cwd();

    const { config, filepath } = await loadConfig<LoadedConfig>({
        name: "bunup.config",
        extensions: [".ts", ".js", ".mjs", ".cjs"],
        maxDepth: 1,
    });

    const configsToProcess: ProcessableConfig[] = !config
        ? [{ rootDir: cwd, options: cliOptions }]
        : await processLoadedConfigs(config, cwd);

    logger.cli(`Using bunup v${version} and bun v${Bun.version}`, {
        muted: true,
    });

    if (filepath) {
        logger.cli(`Using config file: ${getShortFilePath(filepath, 2)}`, {
            muted: true,
        });
    }

    const startTime = performance.now();

    logger.cli("Build started");

    for (const { options, rootDir } of configsToProcess) {
        const optionsArray = ensureArray(options);
        await Promise.all(
            optionsArray.map((o) => {
                if (getResolvedClean(o.clean))
                    cleanOutDir(rootDir, getResolvedOutDir(o.outDir));
            }),
        );
    }

    await Promise.all(
        configsToProcess.flatMap(({ options, rootDir }) => {
            const optionsArray = ensureArray(options);
            return optionsArray.map(async (o) => {
                const mergedOptions = {
                    ...DEFAULT_OPTIONS,
                    ...o,
                    ...cliOptions,
                };

                return handleBuild(mergedOptions, rootDir);
            });
        }),
    );

    const buildTimeMs = performance.now() - startTime;
    const timeDisplay = formatTime(buildTimeMs);
    logger.cli(`⚡️ Build completed in ${timeDisplay}`);

    await validateDtsFiles();

    if (cliOptions.watch) {
        logger.cli("👀 Watching for file changes");
    }

    if (!cliOptions.watch) {
        process.exit(0);
    }
}

export async function validateDtsFiles() {
    if (allFilesUsedToBundleDts.size > 0) {
        await validateFilesUsedToBundleDts(allFilesUsedToBundleDts);
        allFilesUsedToBundleDts.clear();
    }
}

async function handleBuild(options: BuildOptions, rootDir: string) {
    if (options.watch) {
        await watch(options, rootDir);
    } else {
        await build(options, rootDir);
        options.onBuildSuccess?.();
    }
}

main().catch((error) => handleErrorAndExit(error));
