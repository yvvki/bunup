import {parseErrorMessage} from '../errors';
import {logger} from '../logger';
import {resolveImportedTsFilePath} from './utils';

const IMPORT_REGEX =
      /(?:import|export)(?:[\s\n]*(?:type[\s\n]+)?(?:\*|\{[^}]*\}|[\w$]+)[\s\n]+from[\s\n]*|[\s\n]+)(["'`])([^'"]+)\1/g;
const DYNAMIC_IMPORT_REGEX = /import\s*\(\s*(["'`])([^'"]+)\1\s*\)/g;

export async function collectTsFiles(
      entry: string,
      pathAliases: Map<string, string>,
      baseUrl: string,
): Promise<Set<string>> {
      const visited = new Set<string>([entry]);
      const toVisit = [entry];

      while (toVisit.length) {
            const current = toVisit.pop();

            if (!current) continue;

            try {
                  const sourceText = await Bun.file(current).text();
                  const imports = extractImports(sourceText);

                  for (const importPath of imports) {
                        const resolvedTsFilePath =
                              await resolveImportedTsFilePath(
                                    importPath,
                                    pathAliases,
                                    baseUrl,
                                    current,
                              );

                        if (!resolvedTsFilePath) continue;

                        if (!visited.has(resolvedTsFilePath)) {
                              visited.add(resolvedTsFilePath);
                              toVisit.push(resolvedTsFilePath);
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

export function extractImports(sourceText: string): string[] {
      const imports = new Set<string>();
      for (const regex of [IMPORT_REGEX, DYNAMIC_IMPORT_REGEX]) {
            let match;
            while ((match = regex.exec(sourceText)) !== null)
                  imports.add(match[2]);
      }
      return Array.from(imports);
}
