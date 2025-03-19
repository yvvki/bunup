import fs from 'node:fs';

import oxc from 'oxc-transform';

import {parseErrorMessage} from '../errors';
import {logger} from '../logger';

export async function generateDtsContent(
    tsFiles: Set<string>,
): Promise<Map<string, string>> {
    const dtsMap = new Map<string, string>();

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
