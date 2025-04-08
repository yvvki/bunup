import {parseErrorMessage} from '../errors';
import {logger} from '../logger';
import {resolveImportedTsFilePath} from './utils';

const importRegex = /^\s*import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gm;
const exportRegex = /^\s*export\s+.*from\s+['"]([^'"]+)['"]/gm;
const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const importEqualsRegex =
      /import\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const referencePathRegex =
      /\/\/\/\s*<reference\s+path\s*=\s*['"]([^'"]+)['"]\s*\/>/g;
const referenceTypesRegex =
      /\/\/\/\s*<reference\s+types\s*=\s*['"]([^'"]+)['"]\s*\/>/g;

function extractImportsWithRegex(sourceText: string): Set<string> {
      const imports = new Set<string>();
      const regexes = [
            importRegex,
            exportRegex,
            dynamicImportRegex,
            requireRegex,
            importEqualsRegex,
            referencePathRegex,
            referenceTypesRegex,
      ];

      for (const regex of regexes) {
            const matches = sourceText.matchAll(regex);
            for (const match of matches) {
                  if (match[1]) {
                        imports.add(match[1]);
                  }
            }
      }

      return imports;
}

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
                  const imports = extractImportsWithRegex(sourceText);

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
