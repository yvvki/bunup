import { DTS_VIRTUAL_FILE_PREFIX } from "./virtual-files";

export function getDtsPath(tsFilePath: string): string {
    if (
        tsFilePath.endsWith(".d.ts") ||
        tsFilePath.endsWith(".d.mts") ||
        tsFilePath.endsWith(".d.cts")
    )
        return tsFilePath;
    return tsFilePath.replace(/\.(ts|tsx|mts|cts)$/, ".d.ts");
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
