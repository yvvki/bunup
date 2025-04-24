import { isolatedDeclaration } from "oxc-transform";
import pc from "picocolors";
import { parseErrorMessage } from "../errors";
import { logger } from "../logger";
import { getShortFilePath } from "../utils";
import {
    calculateDtsErrorLineAndColumn,
    getDtsPathFromSourceCodePath,
} from "./utils";

/**
 * A map of the generated dts files.
 * The key is the path to the dts file, and the value is the content of the dts file.
 */
export type DtsMap = Map<string, string>;

export async function generateDtsContent(
    tsFiles: Set<string>,
    isWatching: boolean | undefined,
): Promise<DtsMap> {
    let hasErrors = false;
    const dtsMap = new Map<string, string>();

    await Promise.all(
        [...tsFiles].map(async (tsFile) => {
            try {
                const dtsPath = getDtsPathFromSourceCodePath(tsFile);
                const exists = await Bun.file(tsFile).exists();
                if (!exists) return;
                const sourceText = await Bun.file(tsFile).text();
                const { code: declaration, errors } = isolatedDeclaration(
                    tsFile,
                    sourceText,
                );
                if (declaration) {
                    dtsMap.set(dtsPath, declaration);
                }
                for (const error of errors) {
                    if (!hasErrors && !isWatching) {
                        console.log("\n");
                    }
                    const label = error.labels[0];
                    const position = label
                        ? calculateDtsErrorLineAndColumn(
                              sourceText,
                              label.start,
                          )
                        : "";

                    const shortPath = getShortFilePath(tsFile);
                    const errorMessage = `${shortPath}${position}: ${formatDtsErrorMessage(error.message)}`;

                    logger[isWatching ? "warn" : "error"](errorMessage);
                    hasErrors = true;
                }
            } catch (error) {
                logger.warn(
                    `Failed to generate declaration for ${tsFile}: ${parseErrorMessage(error)}`,
                );
            }
        }),
    );

    if (hasErrors && !isWatching) {
        logger.info(
            `TypeScript is just asking for explicit type annotations on your exports. This helps ensure better, more reliable type declarations for your library. Bunup uses TypeScript's ${pc.blue("isolatedDeclarations")} feature to generate these declarations, which requires each export from your library to be fully typed. You can learn more here: ${pc.blue("https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations")}`,
            {
                muted: true,
                verticalSpace: true,
            },
        );

        process.exit(1);
    }

    return dtsMap;
}

function formatDtsErrorMessage(errorMessage: string): string {
    return errorMessage
        .replace(" with --isolatedDeclarations", "")
        .replace(" with --isolatedDeclaration", "");
}
