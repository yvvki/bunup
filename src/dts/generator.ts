import {isolatedDeclaration} from 'oxc-transform';

import {parseErrorMessage} from '../errors';
import {logger} from '../logger';
import {getDtsPath} from './utils';

/**
 * A map of the generated dts files.
 * The key is the path to the dts file, and the value is the content of the dts file.
 */
export type DtsMap = Map<string, string>;

export async function generateDtsContent(
      tsFiles: Set<string>,
): Promise<DtsMap> {
      const dtsMap = new Map<string, string>();

      await Promise.all(
            [...tsFiles].map(async tsFile => {
                  try {
                        const dtsPath = getDtsPath(tsFile);
                        const exists = await Bun.file(tsFile).exists();
                        if (!exists) return;
                        const sourceText = await Bun.file(tsFile).text();
                        const {code: declaration} = isolatedDeclaration(
                              tsFile,
                              sourceText,
                        );

                        if (declaration) {
                              dtsMap.set(dtsPath, declaration);
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
