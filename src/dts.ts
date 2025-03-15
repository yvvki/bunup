import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import {rollup} from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';

import {parseErrorMessage} from './errors';
import {DtsOptions, Format} from './options';
import {cleanJsonString} from './utils';

const TEMP_DTS_OUT_DIR = './dts';

export async function generateDts(
    rootDir: string,
    entry: string,
    tempDir: string,
    format: Format,
    options: Omit<DtsOptions, 'entry'> = {},
): Promise<string> {
    const absoluteRootDir = path.resolve(rootDir);
    const absoluteEntry = path.resolve(absoluteRootDir, entry);
    const absoluteTempDir = path.resolve(tempDir);

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
    if (!path.relative(absoluteRootDir, absoluteEntry).startsWith('..')) {
    } else {
        throw new Error(`Entry file must be within rootDir: ${absoluteEntry}`);
    }

    try {
        fs.mkdirSync(absoluteTempDir, {recursive: true});

        const relativeRootDir = path.relative(absoluteTempDir, absoluteRootDir);
        const entryRelativeToRoot = path.relative(
            absoluteRootDir,
            absoluteEntry,
        );

        // Load existing tsconfig if provided
        let existingCompilerOptions = {};
        const defaultTsconfigPath = path.join(absoluteRootDir, 'tsconfig.json');
        const preferredTsconfigPath = options.preferredTsconfigPath
            ? path.resolve(options.preferredTsconfigPath)
            : defaultTsconfigPath;

        if (fs.existsSync(preferredTsconfigPath)) {
            try {
                const tsconfigContent = JSON.parse(
                    cleanJsonString(
                        fs.readFileSync(preferredTsconfigPath, 'utf8'),
                    ),
                );
                if (tsconfigContent.compilerOptions) {
                    existingCompilerOptions = tsconfigContent.compilerOptions;
                }
            } catch (error) {
                console.warn(
                    `Failed to parse tsconfig at ${preferredTsconfigPath}: ${parseErrorMessage(error)}`,
                );
            }
        }

        const tempTsconfigContent = {
            compilerOptions: {
                ...existingCompilerOptions,
                declaration: true,
                emitDeclarationOnly: true,
                noEmit: false,
                outDir: TEMP_DTS_OUT_DIR,
                rootDir: relativeRootDir,
            },
            include: [`${relativeRootDir}/${entryRelativeToRoot}`],
        };

        const tempTsconfigPath = path.join(absoluteTempDir, 'tsconfig.json');
        fs.writeFileSync(
            tempTsconfigPath,
            JSON.stringify(tempTsconfigContent, null, 2),
        );

        try {
            execSync(`tsc -p ${tempTsconfigPath}`, {stdio: 'inherit'});
        } catch (tscError) {
            throw new Error(
                `TypeScript compilation failed: ${parseErrorMessage(tscError)}`,
            );
        }

        const relativePath = path.relative(absoluteRootDir, absoluteEntry);
        const dtsEntry = path
            .join(absoluteTempDir, TEMP_DTS_OUT_DIR, relativePath)
            .replace(/\.ts$/, '.d.ts');

        if (!fs.existsSync(dtsEntry)) {
            const directDtsPath = path.join(
                absoluteTempDir,
                TEMP_DTS_OUT_DIR,
                path.basename(absoluteEntry).replace(/\.ts$/, '.d.ts'),
            );

            if (fs.existsSync(directDtsPath)) {
                const dtsContent = fs.readFileSync(directDtsPath, 'utf8');
                return dtsContent;
            }

            const dtsOutDirPath = path.join(absoluteTempDir, TEMP_DTS_OUT_DIR);
            const filesInDtsDir = fs.existsSync(dtsOutDirPath)
                ? fs.readdirSync(dtsOutDirPath, {recursive: true})
                : [];

            throw new Error(
                `Generated DTS entry file not found: ${dtsEntry}\n` +
                    `Files in DTS output directory: ${JSON.stringify(filesInDtsDir)}`,
            );
        }

        const outputPath = path.join(absoluteTempDir, 'bundle.d.ts');
        let bundle;
        try {
            bundle = await rollup({
                input: dtsEntry,
                plugins: [dtsPlugin()],
            });

            await bundle.write({
                file: outputPath,
                format: format,
            });
        } catch (rollupError) {
            throw new Error(
                `Rollup bundling failed: ${parseErrorMessage(rollupError)}`,
            );
        } finally {
            if (bundle) {
                await bundle.close();
            }
        }

        if (!fs.existsSync(outputPath)) {
            throw new Error(`Bundled DTS file not generated: ${outputPath}`);
        }
        const dtsContent = fs.readFileSync(outputPath, 'utf8');

        return dtsContent;
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error(`Unknown error: ${String(error)}`);
    } finally {
        if (fs.existsSync(absoluteTempDir)) {
            fs.rmSync(absoluteTempDir, {recursive: true, force: true});
        }
    }
}
