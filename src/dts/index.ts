import {exec} from 'child_process';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

import {rollup} from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';

import {parseErrorMessage} from '../errors';
import {DtsOptions, Format} from '../options';
import {cleanJsonString, getBunupTempDir} from '../utils';

const execAsync = promisify(exec);
const TEMP_DTS_OUT_DIR = './dts';

export async function generateDts(
    rootDir: string,
    outDir: string,
    entry: string,
    dtsTempDir: string,
    format: Format,
    options: Omit<DtsOptions, 'entry'> = {},
): Promise<string> {
    const {absoluteRootDir, absoluteEntry} = validateInputs(rootDir, entry);
    const bunupTempDir = getBunupTempDir(rootDir, outDir);
    const absoluteDtsTempDir = path.resolve(bunupTempDir, dtsTempDir);

    fs.mkdirSync(absoluteDtsTempDir, {recursive: true});

    const tsconfigPath = options.preferredTsconfigPath
        ? path.resolve(options.preferredTsconfigPath)
        : path.join(absoluteRootDir, 'tsconfig.json');
    const existingCompilerOptions = loadTsconfig(tsconfigPath);

    const dtsEntry = await generateDtsFile(
        absoluteRootDir,
        absoluteEntry,
        absoluteDtsTempDir,
        existingCompilerOptions,
    );

    const outputPath = path.join(absoluteDtsTempDir, 'bundle.d.ts');
    await bundleDts(dtsEntry, outputPath, format);

    return fs.readFileSync(outputPath, 'utf8');
}

async function bundleDts(
    dtsEntry: string,
    outputPath: string,
    format: Format,
): Promise<void> {
    let bundle;

    try {
        bundle = await rollup({
            input: dtsEntry,
            plugins: [dtsPlugin()],
        });
        await bundle.write({file: outputPath, format});
    } catch (rollupError) {
        throw new Error(
            `Rollup bundling failed: ${parseErrorMessage(rollupError)}`,
        );
    } finally {
        if (bundle) await bundle.close();
    }

    if (!fs.existsSync(outputPath)) {
        throw new Error(`Bundled DTS file not generated: ${outputPath}`);
    }
}

async function generateDtsFile(
    absoluteRootDir: string,
    absoluteEntry: string,
    absoluteDtsTempDir: string,
    existingCompilerOptions: object,
): Promise<string> {
    const relativeRootDir = path.relative(absoluteDtsTempDir, absoluteRootDir);
    const entryRelativeToRoot = path.relative(absoluteRootDir, absoluteEntry);

    const tempTsconfigContent = {
        compilerOptions: {
            ...existingCompilerOptions,
            declaration: true,
            emitDeclarationOnly: true,
            noEmit: false,
            outDir: TEMP_DTS_OUT_DIR,
            rootDir: relativeRootDir,
            skipLibCheck: true,
        },
        include: [`${relativeRootDir}/${entryRelativeToRoot}`],
    };

    const tempTsconfigPath = path.join(absoluteDtsTempDir, 'tsconfig.json');
    fs.writeFileSync(
        tempTsconfigPath,
        JSON.stringify(tempTsconfigContent, null, 2),
    );

    try {
        const {stdout, stderr} = await execAsync(`tsc -p ${tempTsconfigPath}`);
        if (stderr) console.error(stderr);
        if (stdout) console.log(stdout);
    } catch (tscError) {
        throw new Error(
            `TypeScript compilation failed: ${parseErrorMessage(tscError)}`,
        );
    }

    const relativePath = path.relative(absoluteRootDir, absoluteEntry);
    const dtsEntry = path
        .join(absoluteDtsTempDir, TEMP_DTS_OUT_DIR, relativePath)
        .replace(/\.ts$/, '.d.ts');

    if (!fs.existsSync(dtsEntry)) {
        throw new Error(`Generated DTS entry file not found: ${dtsEntry}`);
    }

    return dtsEntry;
}

function loadTsconfig(tsconfigPath: string): object {
    if (!fs.existsSync(tsconfigPath)) {
        return {};
    }

    try {
        const content = fs.readFileSync(tsconfigPath, 'utf8');
        const json = JSON.parse(cleanJsonString(content));
        return json.compilerOptions || {};
    } catch (error) {
        console.warn(
            `Failed to parse tsconfig at ${tsconfigPath}: ${parseErrorMessage(error)}`,
        );
        return {};
    }
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
