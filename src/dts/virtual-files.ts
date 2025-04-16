import type { Plugin } from "rolldown";

import { filesUsedToBundleDts } from "../build";
import { resolveTypeScriptImportPath } from "../lib/resolve-ts-import";
import type { TsConfigData } from "../loaders";
import type { DtsMap } from "./generator";
import {
    addDtsVirtualPrefix,
    getDtsPath,
    isDtsVirtualFile,
    removeDtsVirtualPrefix,
} from "./utils";

export const DTS_VIRTUAL_FILE_PREFIX = "\0dts:";

export const gerVirtualFilesPlugin = (
    dtsMap: DtsMap,
    tsconfig: TsConfigData,
    rootDir: string,
): Plugin => {
    return {
        name: "bunup:virtual-dts",
        async resolveId(source: string, importer?: string) {
            if (isDtsVirtualFile(source)) return source;
            if (!importer || !isDtsVirtualFile(importer)) return null;

            const resolvedPath = tsconfig.tsconfig
                ? resolveTypeScriptImportPath({
                      path: source,
                      importer: removeDtsVirtualPrefix(importer),
                      tsconfig: tsconfig.tsconfig,
                      rootDir,
                  })
                : null;

            if (!resolvedPath) return null;

            const dtsPath = getDtsPath(resolvedPath);

            if (dtsMap.has(dtsPath)) {
                return addDtsVirtualPrefix(dtsPath);
            }

            return null;
        },
        load(id: string) {
            if (id.startsWith(DTS_VIRTUAL_FILE_PREFIX)) {
                const dtsPath = removeDtsVirtualPrefix(id);
                const content = dtsMap.get(dtsPath);
                if (content) {
                    filesUsedToBundleDts.add(dtsPath);
                    return content;
                }
            }
            return null;
        },
    };
};
