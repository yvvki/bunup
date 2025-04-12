import fs from "node:fs/promises";
import path from "node:path";

import { isolatedDeclaration } from "oxc-transform";

import { BunupDTSBuildError } from "../errors";
import { logger } from "../logger";
import { getShortFilePath, isTypeScriptFile } from "../utils";

export async function validateInputs(
    rootDir: string,
    entry: string,
): Promise<{ absoluteRootDir: string; absoluteEntry: string }> {
    const absoluteRootDir = path.resolve(rootDir);
    const absoluteEntry = path.resolve(absoluteRootDir, entry);

    const isAbsoluteRootDirExists = await fs.exists(absoluteRootDir);

    if (!isAbsoluteRootDirExists) {
        throw new BunupDTSBuildError(
            `Root directory does not exist: ${absoluteRootDir}`,
        );
    }

    const isAbsoluteEntryExists = await Bun.file(absoluteEntry).exists();

    if (!isAbsoluteEntryExists) {
        throw new BunupDTSBuildError(
            `Entry file does not exist: ${absoluteEntry}`,
        );
    }

    if (!isTypeScriptFile(absoluteEntry)) {
        throw new BunupDTSBuildError(
            `Entry file must be a TypeScript file (.ts): ${absoluteEntry}`,
        );
    }

    if (path.relative(absoluteRootDir, absoluteEntry).startsWith("..")) {
        throw new BunupDTSBuildError(
            `Entry file must be within rootDir: ${absoluteEntry}`,
        );
    }

    return { absoluteRootDir, absoluteEntry };
}

export async function validateFilesUsedToBundleDts(
    filesUsedToBundleDts: Set<string>,
): Promise<void> {
    let hasErrors = false;

    await Promise.all(
        [...filesUsedToBundleDts].map(async (file) => {
            try {
                const tsFile = file.replace(/\.d\.ts$/, ".ts");
                const sourceText = await Bun.file(tsFile).text();
                const { errors } = isolatedDeclaration(tsFile, sourceText);

                for (const error of errors) {
                    if (!hasErrors) {
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

                    logger.warn(errorMessage);
                    hasErrors = true;
                }
            } catch {
                // ignore errors
            }
        }),
    );

    if (hasErrors) {
        logger.info(
            "\nYou may have noticed some TypeScript warnings above related to missing type annotations. " +
                'This is because Bunup uses TypeScript\'s "isolatedDeclarations" approach for generating declaration files. ' +
                "This modern approach requires explicit type annotations on exports for better, more accurate type declarations. " +
                "Other bundlers might not show these warnings because they use different, potentially less precise methods. " +
                "Adding the suggested type annotations will not only silence these warnings but also improve the quality " +
                "of your published type definitions, making your library more reliable for consumers.\n",
        );
    }
}

function calculateDtsErrorLineAndColumn(
    sourceText: string,
    labelStart: number,
): string {
    if (labelStart === undefined) return "";

    const lines = sourceText.slice(0, labelStart).split("\n");
    const lineNumber = lines.length;
    const columnStart = lines[lines.length - 1].length + 1;

    return ` (${lineNumber}:${columnStart})`;
}

function formatDtsErrorMessage(errorMessage: string): string {
    return errorMessage
        .replace(" with --isolatedDeclarations", "")
        .replace(" with --isolatedDeclaration", "");
}
