import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { type BuildOptions, build } from "../../build/index.mjs";

export const OUT_DIR = "dist";

export interface BuildResult {
    success: boolean;
    buildTime: number;
    options: BuildOptions;
    files: FileResult[];
    error?: Error;
}

export interface FileResult {
    path: string;
    name: string;
    extension: string;
    size: number;
    content: string;
}

export async function run(
    options: BuildOptions,
    rootDir: string = resolve(process.cwd(), "tests/project"),
): Promise<BuildResult> {
    const result: BuildResult = {
        success: true,
        buildTime: 0,
        options,
        files: [],
    };

    try {
        const startTime = performance.now();

        await build({ clean: true, ...options }, rootDir);

        result.buildTime = performance.now() - startTime;

        const outDirPath = join(rootDir, options.outDir);

        if (!existsSync(outDirPath)) {
            throw new Error(
                `Output directory "${outDirPath}" does not exist after build`,
            );
        }

        const outputFiles = readdirSync(outDirPath);

        for (const fileName of outputFiles) {
            const filePath = join(outDirPath, fileName);
            const fileContent = readFileSync(filePath, "utf-8");
            const fileStats = Bun.file(filePath);

            result.files.push({
                path: filePath,
                name: basename(fileName, extname(fileName)),
                extension: extname(fileName),
                size: fileStats.size,
                content: fileContent,
            });
        }
    } catch (error) {
        result.success = false;
        result.error =
            error instanceof Error ? error : new Error(String(error));
    }

    return result;
}

export function findFile(
    result: BuildResult,
    name: string,
    extension: string,
): FileResult | undefined {
    return result.files.find(
        (file) => file.name === name && file.extension === extension,
    );
}

export function validateBuild(
    result: BuildResult,
    expectedFiles: string[],
): boolean {
    if (!result.success) return false;

    return expectedFiles.every((fileName) => {
        const name = basename(fileName, extname(fileName));
        const ext = extname(fileName);
        return result.files.some(
            (file) => file.name === name && file.extension === ext,
        );
    });
}
