import { build } from "rolldown";
import { dts } from "rolldown-plugin-dts";

import { BunupDTSBuildError, parseErrorMessage } from "../errors";
import {
    getExternalPatterns,
    getNoExternalPatterns,
} from "../helpers/external";
import { logger } from "../logger";
import type { BuildOptions } from "../options";
import { typesResolvePlugin } from "../plugins/types-resolve";
import type { DtsMap } from "./generator";
import { addDtsVirtualPrefix, getDtsPath } from "./utils";
import { gerVirtualFilesPlugin } from "./virtual-files";

export async function bundleDts(
    entryFile: string,
    dtsMap: DtsMap,
    options: BuildOptions,
    packageJson: Record<string, unknown> | null,
    pathAliases: Map<string, string>,
    baseUrl: string,
): Promise<string> {
    const entryDtsPath = getDtsPath(entryFile);
    const initialDtsEntry = addDtsVirtualPrefix(entryDtsPath);

    const externalPatterns = getExternalPatterns(options, packageJson);
    const noExternalPatterns = getNoExternalPatterns(options);

    try {
        const { output } = await build({
            input: initialDtsEntry,
            output: {
                dir: options.outDir,
                inlineDynamicImports: true,
            },
            write: false,
            onwarn(warning, handler) {
                if (
                    [
                        "UNRESOLVED_IMPORT",
                        "CIRCULAR_DEPENDENCY",
                        "EMPTY_BUNDLE",
                    ].includes(warning.code ?? "")
                )
                    return;
                handler(warning);
            },
            plugins: [
                gerVirtualFilesPlugin(dtsMap, pathAliases, baseUrl),
                typeof options.dts === "object" &&
                    "resolve" in options.dts &&
                    typesResolvePlugin(
                        typeof options.dts.resolve === "boolean"
                            ? undefined
                            : options.dts.resolve,
                    ),
                dts({
                    dtsInput: true,
                }),
            ],
            external: (source) =>
                externalPatterns.some((re) => re.test(source)) &&
                !noExternalPatterns.some((re) => re.test(source)),
        });

        if (!output[0]?.code) {
            logger.warn(
                `Generated empty declaration file for entry "${entryFile}"`,
                {
                    muted: true,
                },
            );

            return "";
        }

        return output[0].code;
    } catch (error) {
        throw new BunupDTSBuildError(
            `DTS bundling failed for entry "${entryFile}": ${parseErrorMessage(error)}`,
        );
    }
}
