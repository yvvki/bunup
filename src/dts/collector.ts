import fs from 'node:fs';
import path from 'node:path';

import {parseErrorMessage} from '../errors';
import {TsConfig} from '../helpers/load-tsconfig';
import {logger} from '../logger';
import {
        extractPathAliases,
        getBaseUrl,
        resolveNonRelativeImport,
} from './utils';

const IMPORT_REGEX =
        /(?:import|export)(?:[\s\n]*(?:type[\s\n]+)?(?:\*|\{[^}]*\}|[\w$]+)[\s\n]+from[\s\n]*|[\s\n]+)(["'`])([^'"]+)\1/g;
const DYNAMIC_IMPORT_REGEX = /import\s*\(\s*(["'`])([^'"]+)\1\s*\)/g;

export async function collectTsFiles(
        entry: string,
        tsconfig: TsConfig,
): Promise<Set<string>> {
        const visited = new Set<string>([entry]);
        const toVisit = [entry];
        const pathAliases = extractPathAliases(tsconfig);
        const baseUrl = getBaseUrl(tsconfig);

        while (toVisit.length) {
                const current = toVisit.pop();

                if (!current) continue;

                try {
                        const sourceText = await fs.promises.readFile(
                                current,
                                'utf8',
                        );
                        const imports = extractImports(sourceText);

                        for (const importPath of imports) {
                                const resolvedPath = importPath.startsWith('.')
                                        ? path.resolve(
                                                  path.dirname(current),
                                                  importPath,
                                          )
                                        : resolveNonRelativeImport(
                                                  importPath,
                                                  pathAliases,
                                                  baseUrl,
                                          );

                                if (!resolvedPath) continue;

                                const tsFile = resolveTsFile(resolvedPath);
                                if (tsFile && !visited.has(tsFile)) {
                                        visited.add(tsFile);
                                        toVisit.push(tsFile);
                                }
                        }
                } catch (error) {
                        logger.warn(
                                `Error processing ${current}: ${parseErrorMessage(error)}`,
                        );
                }
        }

        return visited;
}

function extractImports(sourceText: string): string[] {
        const imports = new Set<string>();
        for (const regex of [IMPORT_REGEX, DYNAMIC_IMPORT_REGEX]) {
                let match;
                while ((match = regex.exec(sourceText)) !== null)
                        imports.add(match[2]);
        }
        return Array.from(imports);
}

function resolveTsFile(basePath: string): string | null {
        const extensions = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
        for (const ext of extensions) {
                const file = `${basePath}${ext}`;
                if (
                        fs.existsSync(file) &&
                        (file.endsWith('.ts') || file.endsWith('.tsx'))
                )
                        return file;
        }
        return null;
}
