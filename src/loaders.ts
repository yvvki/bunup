import fs from 'node:fs';

import {CompilerOptions} from 'typescript';

import {parseErrorMessage} from './errors';
import {logger} from './logger';
import {BunupOptions, DEFAULT_OPTIONS} from './options';
import {cleanJsonString} from './utils';

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
        const filePath = `${cwd}/bunup.config${ext}`;
        try {
            const file = Bun.file(filePath);
            const exists = await file.exists();

            if (!exists) continue;

            let content;

            if (ext === '.json' || ext === '.jsonc') {
                const text = await file.text();
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
            logger.error(
                `Failed to load config from ${filePath}: ${parseErrorMessage(error)}`,
            );
        }

        if (configs.length > 0) break;
    }

    return configs;
}

export async function loadPackageJson(
    cwd: string,
): Promise<Record<string, any> | null> {
    const packageJsonPath = `${cwd}/package.json`;

    try {
        const file = Bun.file(packageJsonPath);
        const exists = await file.exists();

        if (!exists) {
            return null;
        }

        const text = await file.text();
        const content = JSON.parse(cleanJsonString(text));

        return content;
    } catch (error) {
        return null;
    }
}

export function loadTsconfig(tsconfigPath: string): CompilerOptions {
    if (!fs.existsSync(tsconfigPath)) {
        return {};
    }

    try {
        const content = fs.readFileSync(tsconfigPath, 'utf8');
        const json = JSON.parse(cleanJsonString(content));
        return json.compilerOptions || {};
    } catch (error) {
        logger.warn(
            `Failed to parse tsconfig at ${tsconfigPath}: ${parseErrorMessage(error)}`,
        );
        return {};
    }
}
