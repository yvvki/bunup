import path from 'path';

import {Plugin} from 'rollup';

import {allFilesUsedToBundleDts} from '../cli';
import {DtsMap} from './generator';

export const VIRTUAL_FILES_PREFIX = '\0virtual:';

export const gerVirtualFilesPlugin = (dtsMap: DtsMap): Plugin => {
      return {
            name: 'bunup:virtual-dts',
            resolveId(source: string, importer?: string) {
                  if (source.startsWith(VIRTUAL_FILES_PREFIX)) return source;
                  if (
                        !importer?.startsWith(VIRTUAL_FILES_PREFIX) ||
                        !source.startsWith('.')
                  )
                        return null;

                  const importerPath = importer.slice(
                        VIRTUAL_FILES_PREFIX.length,
                  );
                  let resolvedPath = path.resolve(
                        path.dirname(importerPath),
                        source,
                  );

                  // if the import is a dot, for example `import '.'`, etc, we need to resolve the index.d.ts file
                  if (source === '.') {
                        const indexPath = path.join(
                              path.dirname(importerPath),
                              'index.d.ts',
                        );
                        if (dtsMap.has(indexPath)) {
                              return `${VIRTUAL_FILES_PREFIX}${indexPath}`;
                        }

                        resolvedPath = path.dirname(importerPath);
                  }

                  if (dtsMap.has(resolvedPath)) {
                        return `${VIRTUAL_FILES_PREFIX}${resolvedPath}`;
                  }

                  const fullPath = `${resolvedPath}.d.ts`;
                  if (dtsMap.has(fullPath)) {
                        return `${VIRTUAL_FILES_PREFIX}${fullPath}`;
                  }

                  if (source.startsWith('.')) {
                        const indexPath = path.join(resolvedPath, 'index.d.ts');
                        if (dtsMap.has(indexPath)) {
                              return `${VIRTUAL_FILES_PREFIX}${indexPath}`;
                        }
                  }

                  return null;
            },
            load(id: string) {
                  if (id.startsWith(VIRTUAL_FILES_PREFIX)) {
                        const filePath = id.slice(VIRTUAL_FILES_PREFIX.length);
                        const content = dtsMap.get(filePath);
                        if (content) {
                              allFilesUsedToBundleDts.add(filePath);
                              return content;
                        }
                  }
                  return null;
            },
      };
};
