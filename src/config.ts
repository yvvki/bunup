import {parseError} from './errors';
import {logError, logWarn} from './log';
import {BunupOptions, DEFAULT_OPTIONS} from './options';

declare const Bun: typeof import('bun');

export function defineConfig(options: BunupOptions): BunupOptions {
    return options;
}

const EXTENSIONS = [
    '.ts',
    '.js',
    '.mjs',
    '.cjs',
    '.mts',
    '.cts',
    '.json',
    '.jsonc',
];

const CONFIG_NAMES = ['bunup.config'];

export async function loadConfigs(
    cwd: string,
): Promise<{options: BunupOptions; rootDir: string}[]> {
    const configs: {options: BunupOptions; rootDir: string}[] = [];
    const visitedDirs = new Set<string>();

    async function searchDir(dir: string) {
        if (visitedDirs.has(dir)) return;
        visitedDirs.add(dir);

        for (const name of CONFIG_NAMES) {
            for (const ext of EXTENSIONS) {
                const filePath = `${dir}/${name}${ext}`;
                try {
                    if (await Bun.file(filePath).exists()) {
                        let content;

                        if (ext === '.json' || ext === '.jsonc') {
                            const text = await Bun.file(filePath).text();
                            content = JSON.parse(text);
                        } else {
                            const imported = await import(filePath);
                            content = imported.default || imported;

                            if (!content) {
                                logWarn(
                                    `No default export found in ${filePath}`,
                                );
                                content = {};
                            }
                        }

                        configs.unshift({
                            options: {...DEFAULT_OPTIONS, ...content},
                            rootDir: dir,
                        });
                    }
                } catch (error) {
                    logError(
                        `Failed to load config from ${filePath}: ${parseError(error)}`,
                    );
                }
            }
        }

        const parentDir = dir.split('/').slice(0, -1).join('/') || '/';
        if (parentDir !== dir) await searchDir(parentDir);
    }

    await searchDir(cwd);
    return configs;
}
