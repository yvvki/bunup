import fs from 'node:fs';
import path from 'node:path';

import {BunupBuildError, parseErrorMessage} from './errors';
import {logger} from './logger';
import {BunupOptions, DEFAULT_OPTIONS} from './options';

export async function loadConfigs(
    cwd: string,
): Promise<{options: BunupOptions; rootDir: string}[]> {
    const configs: {options: BunupOptions; rootDir: string}[] = [];

    for (const ext of [
        '.ts',
        '.js',
        '.mjs',
        '.cjs',
        '.mts',
        '.cts',
        '.json',
        '.jsonc',
    ]) {
        const filePath = path.join(cwd, `bunup.config${ext}`);
        try {
            if (!fs.existsSync(filePath)) continue;

            let content;

            if (ext === '.json' || ext === '.jsonc') {
                const text = fs.readFileSync(filePath, 'utf8');
                content = JSON.parse(text);
            } else {
                const imported = await import(`file://${filePath}`);
                content = imported.default || imported;

                if (!content) {
                    logger.warn(`No default export found in ${filePath}`);
                    content = {};
                }
            }

            if (Array.isArray(content)) {
                for (const item of content) {
                    configs.push({
                        options: {...DEFAULT_OPTIONS, ...item},
                        rootDir: cwd,
                    });
                }
            } else {
                configs.push({
                    options: {...DEFAULT_OPTIONS, ...content},
                    rootDir: cwd,
                });
            }

            break;
        } catch (error) {
            throw new BunupBuildError(
                `Failed to load config from ${filePath}: ${parseErrorMessage(error)}`,
            );
        }

        if (configs.length > 0) break;
    }

    return configs;
}

export function loadPackageJson(cwd: string): Record<string, unknown> | null {
    const packageJsonPath = path.join(cwd, 'package.json');

    try {
        if (!fs.existsSync(packageJsonPath)) {
            return null;
        }

        const text = fs.readFileSync(packageJsonPath, 'utf8');
        const content = JSON.parse(text);

        return content;
    } catch (error) {
        logger.warn(
            `Failed to load package.json at ${packageJsonPath}: ${parseErrorMessage(error)}`,
        );
        return null;
    }
}
