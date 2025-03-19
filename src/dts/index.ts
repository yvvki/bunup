import fs from 'node:fs';
import path from 'node:path';

import {BunupDTSBuildError} from '../errors';
import {loadTsconfig} from '../helpers/load-tsconfig';
import {BunupOptions, Format} from '../options';
import {bundleDtsContent} from './bundler';
import {collectTsFiles} from './collector';
import {generateDtsContent} from './generator';

export async function generateDts(
    rootDir: string,
    entry: string,
    format: Format,
    options: BunupOptions,
): Promise<string> {
    const {absoluteRootDir, absoluteEntry} = validateInputs(rootDir, entry);
    const tsconfig = loadTsconfig(options.preferredTsconfigPath);
    const tsFiles = await collectTsFiles(absoluteEntry, tsconfig);
    const dtsMap = await generateDtsContent(tsFiles);
    return bundleDtsContent(
        absoluteEntry,
        dtsMap,
        format,
        options,
        absoluteRootDir,
        tsconfig,
    );
}

function validateInputs(
    rootDir: string,
    entry: string,
): {absoluteRootDir: string; absoluteEntry: string} {
    const absoluteRootDir = path.resolve(rootDir);
    const absoluteEntry = path.resolve(absoluteRootDir, entry);

    if (!fs.existsSync(absoluteRootDir))
        throw new BunupDTSBuildError(
            `Root directory does not exist: ${absoluteRootDir}`,
        );
    if (!fs.existsSync(absoluteEntry))
        throw new BunupDTSBuildError(
            `Entry file does not exist: ${absoluteEntry}`,
        );
    if (!absoluteEntry.endsWith('.ts'))
        throw new BunupDTSBuildError(
            `Entry file must be a TypeScript file (.ts): ${absoluteEntry}`,
        );
    if (path.relative(absoluteRootDir, absoluteEntry).startsWith('..')) {
        throw new BunupDTSBuildError(
            `Entry file must be within rootDir: ${absoluteEntry}`,
        );
    }

    return {absoluteRootDir, absoluteEntry};
}
