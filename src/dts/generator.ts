import fs from 'node:fs';

import {isolatedDeclaration} from 'oxc-transform';

import {parseErrorMessage} from '../errors';
import {logger} from '../logger';

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
                        const dtsPath = tsFile.replace(/\.tsx?$/, '.d.ts');
                        const sourceText = await fs.promises.readFile(
                              tsFile,
                              'utf8',
                        );
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
