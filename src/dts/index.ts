import fs from 'fs';
import path from 'path';

import {rollup} from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';
import {
    CompilerOptions,
    createProgram,
    ModuleKind,
    ModuleResolutionKind,
    ScriptTarget,
} from 'typescript';

import {parseErrorMessage} from '../errors';
import {logger} from '../logger';
import {DtsOptions, Format} from '../options';
import {cleanJsonString} from '../utils';

export async function generateDts(
    rootDir: string,
    entry: string,
    format: Format,
    options: Omit<DtsOptions, 'entry'> = {},
): Promise<string> {
    const {absoluteRootDir, absoluteEntry} = validateInputs(rootDir, entry);

    const tsconfigPath = options.preferredTsconfigPath
        ? path.resolve(options.preferredTsconfigPath)
        : path.join(absoluteRootDir, 'tsconfig.json');
    const existingCompilerOptions = loadTsconfig(tsconfigPath);

    const dtsContent = await generateDtsInMemory(
        absoluteEntry,
        existingCompilerOptions,
    );

    const bundledDts = await bundleDtsInMemory(
        dtsContent,
        absoluteEntry,
        format,
    );

    return bundledDts;
}

async function bundleDtsInMemory(
    dtsContent: string,
    entryFilePath: string,
    format: Format,
): Promise<string> {
    let bundle;
    let result = '';

    const virtualFs = {
        [entryFilePath.replace(/\.ts$/, '.d.ts')]: dtsContent,
    };

    try {
        bundle = await rollup({
            input: entryFilePath.replace(/\.ts$/, '.d.ts'),
            plugins: [
                dtsPlugin(),
                {
                    name: 'virtual-fs',
                    resolveId(id) {
                        if (virtualFs[id]) return id;
                        return null;
                    },
                    load(id) {
                        if (virtualFs[id]) return virtualFs[id];
                        return null;
                    },
                },
            ],
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

async function generateDtsInMemory(
    absoluteEntry: string,
    existingCompilerOptions: object,
): Promise<string> {
    const compilerOptions: CompilerOptions = {
        ...existingCompilerOptions,
        declaration: true,
        emitDeclarationOnly: true,
        noEmit: false,
        skipLibCheck: true,
        module: ModuleKind.ESNext,
        moduleResolution: ModuleResolutionKind.Node10,
        target: ScriptTarget.ES2020,
    };

    let dtsContent = '';

    try {
        const program = createProgram([absoluteEntry], compilerOptions);
        const emitResult = program.emit(undefined, (fileName, data) => {
            if (fileName.endsWith('.d.ts')) {
                dtsContent = data;
            }
        });

        const diagnostics = [
            ...program.getSyntacticDiagnostics(),
            ...program.getSemanticDiagnostics(),
            ...emitResult.diagnostics,
        ];

        if (diagnostics.length > 0) {
            const errorMessages = diagnostics
                .map(diagnostic => diagnostic.messageText.toString())
                .join('\n');
            throw new Error(`TypeScript compilation errors:\n${errorMessages}`);
        }
    } catch (tscError) {
        throw new Error(
            `TypeScript compilation failed: ${parseErrorMessage(tscError)}`,
        );
    }

    if (!dtsContent) {
        throw new Error('Failed to generate DTS content');
    }

    return dtsContent;
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
        logger.warn(
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
