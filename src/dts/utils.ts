import type { TsConfigData } from "../loaders";
import { DTS_VIRTUAL_FILE_PREFIX } from "./virtual-files";

export function getCompilerOptions(tsconfig: TsConfigData) {
    return (
        (
            tsconfig.tsconfig as {
                compilerOptions: Record<string, unknown> | undefined;
            }
        ).compilerOptions ?? {}
    );
}

export function isDtsFile(filePath: string): boolean {
    return (
        filePath.endsWith(".d.ts") ||
        filePath.endsWith(".d.mts") ||
        filePath.endsWith(".d.cts")
    );
}

export function isSourceCodeFile(filePath: string): boolean {
    return (
        /\.(js|mjs|cjs|ts|mts|cts|tsx|jsx)$/.test(filePath) &&
        !isDtsFile(filePath)
    );
}

export function getDtsPath(filePath: string): string {
    if (isDtsFile(filePath)) return filePath;
    return filePath.replace(/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/, ".d.ts");
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
