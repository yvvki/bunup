import fs from 'fs';
import path from 'path';

import {
    generateDtsBundle,
    type CompilationOptions,
    type EntryPointConfig,
} from 'dts-bundle-generator';

import {commonPathPrefix, determineSeparator} from './utils';

type Options = Omit<EntryPointConfig, 'filePath'> & {
    compilationOptions?: CompilationOptions;
};

export function dts(options?: Options): import('bun').BunPlugin {
    return {
        name: 'dts',
        async setup(build) {
            const {compilationOptions, ...rest} = options || {};

            const entrypoints = [...build.config.entrypoints].sort();
            const entries = entrypoints.map(entry => {
                return {
                    filePath: entry,
                    ...rest,
                };
            });

            const result = generateDtsBundle(entries, {
                ...compilationOptions,
            });

            const outDir = build.config.outdir;

            if (!outDir) {
                throw new Error('outdir is required to generate dts');
            }

            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, {recursive: true});
            }

            let commonPrefix = commonPathPrefix(
                entrypoints,
                determineSeparator(entrypoints),
            );

            // If commonPrefix is empty or equals the current working directory,
            // use the parent directory of the first entrypoint
            if (!commonPrefix || commonPrefix === process.cwd()) {
                commonPrefix = path.dirname(entrypoints[0]);
            }

            await Promise.all(
                entrypoints.map((entry, index) => {
                    const relativePath = path.relative(commonPrefix, entry);
                    const dtsFile = relativePath.replace(/\.[jtm]s$/, '.d.ts');
                    const outFile = path.join(outDir, dtsFile);
                    const outFileDir = path.dirname(outFile);

                    if (!fs.existsSync(outFileDir)) {
                        fs.mkdirSync(outFileDir, {recursive: true});
                    }

                    return Bun.write(outFile, result[index]);
                }),
            );
        },
    };
}
