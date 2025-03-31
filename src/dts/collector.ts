import fs from 'node:fs';
import path from 'node:path';

import {parseErrorMessage} from '../errors';
import {TsConfig} from '../helpers/load-tsconfig';
import {logger} from '../logger';

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
                              ? path.resolve(path.dirname(current), importPath)
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

function getBaseUrl(tsconfig: TsConfig): string {
      const tsconfigDir = path.dirname(tsconfig.path || '');
      return tsconfig.data?.compilerOptions?.baseUrl
            ? path.resolve(tsconfigDir, tsconfig.data.compilerOptions.baseUrl)
            : tsconfigDir;
}

function extractPathAliases(tsconfig: TsConfig): Map<string, string> {
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
