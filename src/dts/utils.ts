import path from 'node:path';

import {TsConfig} from '../helpers/load-tsconfig';
import {DTS_VIRTUAL_FILE_PREFIX} from './virtual-files';

export function getDtsPath(tsFilePath: string): string {
      return tsFilePath.replace(/\.tsx?$/, '.d.ts');
}

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

function resolveNonRelativeImport(
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

async function resolveTsFile(basePath: string): Promise<string | null> {
      const extensions = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
      for (const ext of extensions) {
            const file = `${basePath}${ext}`;
            const exists = await Bun.file(file).exists();
            if (exists && (file.endsWith('.ts') || file.endsWith('.tsx')))
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
      const resolvedPath = importPath.startsWith('.')
            ? path.resolve(path.dirname(importer || ''), importPath)
            : resolveNonRelativeImport(importPath, pathAliases, baseUrl);

      if (!resolvedPath) return Promise.resolve(null);

      return resolveTsFile(resolvedPath);
}

export function isDtsVirtualFile(filePath: string): boolean {
      return filePath.startsWith(DTS_VIRTUAL_FILE_PREFIX);
}

export function removeDtsVirtualPrefix(filePath: string): string {
      return filePath.replace(DTS_VIRTUAL_FILE_PREFIX, '');
}

export function addDtsVirtualPrefix(filePath: string): string {
      return `${DTS_VIRTUAL_FILE_PREFIX}${filePath}`;
}
