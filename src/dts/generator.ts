import fs from 'node:fs';
import path from 'node:path';

import oxc from 'oxc-transform';

import {parseErrorMessage} from '../errors';
import {TsConfig} from '../helpers/load-tsconfig';
import {logger} from '../logger';
import {
    extractPathAliases,
    getBaseUrl,
    resolveNonRelativeImport,
} from './utils';

export async function generateDtsContent(
    tsFiles: Set<string>,
    tsconfig: TsConfig,
): Promise<Map<string, string>> {
    const dtsMap = new Map<string, string>();
    const baseUrl = getBaseUrl(tsconfig);
    const pathAliases = extractPathAliases(tsconfig);

    await Promise.all(
        [...tsFiles].map(async tsFile => {
            try {
                const dtsPath = tsFile.replace(/\.tsx?$/, '.d.ts');
                const sourceText = await fs.promises.readFile(tsFile, 'utf8');
                const {code: declaration} = oxc.isolatedDeclaration(
                    tsFile,
                    sourceText,
                );

                if (declaration) {
                    const processed = processPathAliases(
                        declaration,
                        pathAliases,
                        baseUrl,
                        path.dirname(tsFile),
                    );
                    dtsMap.set(dtsPath, processed);
                }
            } catch (error) {
                logger.warn(
                    `Failed to generate declaration for ${tsFile}: ${parseErrorMessage(error)}`,
                );
            }
        }),
    );

    return dtsMap;
}

function processPathAliases(
    declaration: string,
    pathAliases: Map<string, string>,
    baseUrl: string,
    currentDir: string,
): string {
    return declaration.replace(
        /(import|export)(.+?from\s+['"])([^'"]+)(['"])/g,
        (match, keyword, middle, importPath, quote) => {
            if (importPath.startsWith('.') || importPath.startsWith('/'))
                return match;

            const resolvedPath = resolveNonRelativeImport(
                importPath,
                pathAliases,
                baseUrl,
            );
            if (!resolvedPath) return match;

            const relativePath = path
                .relative(currentDir, resolvedPath)
                .replace(/\\/g, '/');
            const normalizedPath = relativePath.startsWith('.')
                ? relativePath
                : `./${relativePath}`;
            return `${keyword}${middle}${normalizedPath}${quote}`;
        },
    );
}
