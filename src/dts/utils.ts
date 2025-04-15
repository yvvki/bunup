import path from "node:path";

import type { TsConfigData } from "../loaders";
import { DTS_VIRTUAL_FILE_PREFIX } from "./virtual-files";

function getCompilerOptions(tsconfig: TsConfigData) {
    return tsconfig.tsconfig?.compilerOptions as
        | {
              baseUrl: string;
              paths: Record<string, string[]>;
          }
        | undefined;
}

export function getDtsPath(tsFilePath: string): string {
    return tsFilePath.replace(/\.(ts|tsx|mts|cts)$/, ".d.ts");
}

export function getBaseUrl(tsconfig: TsConfigData): string {
    if (!tsconfig.path) return "";
    const tsconfigDir = path.dirname(tsconfig.path);
    const compilerOptions = getCompilerOptions(tsconfig);
    return compilerOptions?.baseUrl
        ? path.resolve(tsconfigDir, compilerOptions.baseUrl)
        : tsconfigDir;
}

export function extractPathAliases(
    tsconfig: TsConfigData,
): Map<string, string> {
    const aliases = new Map<string, string>();
    const paths = getCompilerOptions(tsconfig)?.paths;
    if (!paths) return aliases;

    const baseUrl = getBaseUrl(tsconfig);
    for (const [alias, targets] of Object.entries(paths)) {
        if (Array.isArray(targets) && targets.length) {
            const pattern = alias.replace(/\*/g, "(.*)");

            let wildcardCount = 0;
            const target = targets[0].replace(
                /\*/g,
                () => `$${++wildcardCount}`,
            );

            aliases.set(`^${pattern}$`, path.join(baseUrl, target));
        }
    }
    return aliases;
}
function resolveNonRelativeImport(
    importPath: string,
    pathAliases: Map<string, string>,
    baseUrl: string,
): string | null {
    for (const [pattern, target] of pathAliases) {
        const regex = new RegExp(pattern);
        const match = importPath.match(regex);
        if (match) return target.replace("$1", match[1] || "");
    }
    return baseUrl ? path.join(baseUrl, importPath) : null;
}

async function resolveTsFile(basePath: string): Promise<string | null> {
    const extensions = [
        "",
        ".ts",
        ".tsx",
        ".cts",
        ".mts",
        "/index.ts",
        "/index.tsx",
        "/index.cts",
        "/index.mts",
    ];
    for (const ext of extensions) {
        const file = `${basePath}${ext}`;
        const exists = await Bun.file(file).exists();
        if (
            exists &&
            (file.endsWith(".ts") ||
                file.endsWith(".tsx") ||
                file.endsWith(".cts") ||
                file.endsWith(".mts"))
        )
            return file;
    }
    return null;
}

export function resolveImportedTsFilePath(
    importPath: string,
    pathAliases: Map<string, string>,
    baseUrl: string,
    importer?: string,
): Promise<string | null> {
    const resolvedPath = importPath.startsWith(".")
        ? path.resolve(path.dirname(importer || ""), importPath)
        : resolveNonRelativeImport(importPath, pathAliases, baseUrl);

    if (!resolvedPath) return Promise.resolve(null);

    return resolveTsFile(resolvedPath);
}

export function isDtsVirtualFile(filePath: string): boolean {
    return filePath.startsWith(DTS_VIRTUAL_FILE_PREFIX);
}

export function removeDtsVirtualPrefix(filePath: string): string {
    return filePath.replace(DTS_VIRTUAL_FILE_PREFIX, "");
}

export function addDtsVirtualPrefix(filePath: string): string {
    return `${DTS_VIRTUAL_FILE_PREFIX}${filePath}`;
}
