import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { mkdirSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { type BuildOptions, build } from "../build/index.mjs";

const TEST_DIR = resolve(process.cwd(), "tests");
const TEST_PROJECT_DIR = resolve(TEST_DIR, "fixtures");
const OUTPUT_DIR = resolve(TEST_PROJECT_DIR, ".output");

if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
}

export interface BuildResult {
    success: boolean;
    buildTime: number;
    options: Omit<BuildOptions, "outDir">;
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

function getFullExtension(fileName: string): string {
    const baseName = basename(fileName);
    const firstDotIndex = baseName.indexOf(".");
    return firstDotIndex === -1 ? "" : baseName.substring(firstDotIndex);
}

function generateRandomSuffix(): string {
    return Math.random().toString(36).substring(2, 15);
}

export async function run(
    options: Omit<BuildOptions, "outDir">,
    rootDir: string = TEST_PROJECT_DIR,
): Promise<BuildResult> {
    const result: BuildResult = {
        success: true,
        buildTime: 0,
        options,
        files: [],
    };

    const uniqueOutDir = join(".output", `build-${generateRandomSuffix()}`);

    try {
        const startTime = performance.now();

        await build(
            { ...options, outDir: uniqueOutDir, silent: true },
            rootDir,
        );

        result.buildTime = performance.now() - startTime;

        const outDirPath = join(rootDir, uniqueOutDir);

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
            const extension = getFullExtension(fileName);
            const name = basename(fileName, extension);

            result.files.push({
                path: filePath,
                name,
                extension,
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

export function cleanOutputDir(): void {
    if (existsSync(OUTPUT_DIR)) {
        rmSync(OUTPUT_DIR, { recursive: true, force: true });
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }
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

export function validateBuildFiles(
    result: BuildResult,
    expectedFiles: string[],
): boolean {
    if (!result.success) return false;

    return expectedFiles.every((fileName) => {
        const extension = getFullExtension(fileName);
        const name = basename(fileName, extension);
        return result.files.some((file) => {
            return file.name === name && file.extension === extension;
        });
    });
}

export function mutateFile(path: string, mutator: (content: string) => string) {
    const filePath = join(TEST_PROJECT_DIR, path);
    const content = readFileSync(filePath, "utf-8");
    const mutatedContent = mutator(content);
    writeFileSync(filePath, mutatedContent);
    return () => {
        writeFileSync(filePath, content);
    };
}
