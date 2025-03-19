import path from 'node:path';

import {TsConfig} from '../helpers/load-tsconfig';

export function getBaseUrl(tsconfig: TsConfig): string {
    const tsconfigDir = path.dirname(tsconfig.path || '');
    return tsconfig.data?.compilerOptions?.baseUrl
        ? path.resolve(tsconfigDir, tsconfig.data.compilerOptions.baseUrl)
        : tsconfigDir;
}

export function extractPathAliases(tsconfig: TsConfig): Map<string, string> {
    const aliases = new Map<string, string>();
    const paths = tsconfig.data?.compilerOptions?.paths;
    if (!paths) return aliases;

    const baseUrl = getBaseUrl(tsconfig);
    for (const [alias, targets] of Object.entries(paths)) {
        if (Array.isArray(targets) && targets.length) {
            const pattern = alias.replace(/\*/g, '(.*)');
            const target = targets[0].replace(/\*/g, '$1');
            aliases.set(`^${pattern}$`, path.join(baseUrl, target));
        }
    }
    return aliases;
}

export function resolveNonRelativeImport(
    importPath: string,
    pathAliases: Map<string, string>,
    baseUrl: string,
): string | null {
    for (const [pattern, target] of pathAliases) {
        const regex = new RegExp(pattern);
        const match = importPath.match(regex);
        if (match) return target.replace('$1', match[1] || '');
    }
    return baseUrl ? path.join(baseUrl, importPath) : null;
}

export function calculateDtsErrorLineAndColumn(
    sourceText: string,
    labelStart: number,
): string {
    if (labelStart === undefined) return '';

    const lines = sourceText.slice(0, labelStart).split('\n');
    const lineNumber = lines.length;
    const columnStart = lines[lines.length - 1].length + 1;

    return ` (${lineNumber}:${columnStart})`;
}

export function formatDtsErrorMessage(errorMessage: string): string {
    return errorMessage
        .replace(' with --isolatedDeclaration', '')
        .replace(' with --isolatedDeclarations', '');
}
