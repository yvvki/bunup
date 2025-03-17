import fs from 'fs';
import path from 'path';

import {rollup} from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';

import {parseErrorMessage} from '../errors';
import {loadPackageJson} from '../loaders';
import {BunupOptions, DtsOptions, Format} from '../options';
import {getPackageDeps} from '../utils';

export async function generateDts(
    rootDir: string,
    entry: string,
    format: Format,
    options: BunupOptions,
    dtsOptions: Omit<DtsOptions, 'entry'> = {},
): Promise<string> {
    const {absoluteRootDir, absoluteEntry} = validateInputs(rootDir, entry);

    const tsconfigPath = dtsOptions.preferredTsconfigPath
        ? path.resolve(dtsOptions.preferredTsconfigPath)
        : path.join(absoluteRootDir, 'tsconfig.json');

    const packageJson = await loadPackageJson(absoluteRootDir);

    const rollupExternal = [
        ...(options.external || []),
        ...getPackageDeps(packageJson).map(
            dep => new RegExp(`^${dep}($|\\/|\\\\)`),
        ),
    ];

    let bundle;
    let result = '';

    try {
        bundle = await rollup({
            input: absoluteEntry,
            onwarn(warning, handler) {
                if (
                    warning.code === 'UNRESOLVED_IMPORT' ||
                    warning.code === 'CIRCULAR_DEPENDENCY' ||
                    warning.code === 'EMPTY_BUNDLE'
                ) {
                    return;
                }
                return handler(warning);
            },
            plugins: [
                dtsPlugin({
                    tsconfig: tsconfigPath,
                }),
            ],
            external: rollupExternal,
        });

        const {output} = await bundle.generate({format});
        result = output[0].code;
    } catch (rollupError) {
        throw new Error(
            `Rollup bundling failed: ${parseErrorMessage(rollupError)}`,
        );
    } finally {
        if (bundle) await bundle.close();
    }

    if (!result) {
        throw new Error('Failed to generate bundled DTS content');
    }

    return result;
}

function validateInputs(
    rootDir: string,
    entry: string,
): {absoluteRootDir: string; absoluteEntry: string} {
    const absoluteRootDir = path.resolve(rootDir);
    const absoluteEntry = path.resolve(absoluteRootDir, entry);

    if (!fs.existsSync(absoluteRootDir)) {
        throw new Error(`Root directory does not exist: ${absoluteRootDir}`);
    }
    if (!fs.existsSync(absoluteEntry)) {
        throw new Error(`Entry file does not exist: ${absoluteEntry}`);
    }
    if (!absoluteEntry.endsWith('.ts')) {
        throw new Error(
            `Entry file must be a TypeScript file (.ts): ${absoluteEntry}`,
        );
    }
    if (path.relative(absoluteRootDir, absoluteEntry).startsWith('..')) {
        throw new Error(`Entry file must be within rootDir: ${absoluteEntry}`);
    }

    return {absoluteRootDir, absoluteEntry};
}
