import {parseErrorMessage} from './errors';
import {logger} from './logger';
import {BunupOptions, DEFAULT_OPTIONS} from './options';

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

    for (const name of CONFIG_NAMES) {
        for (const ext of EXTENSIONS) {
            const filePath = `${cwd}/${name}${ext}`;
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

                configs.push({
                    options: {...DEFAULT_OPTIONS, ...content},
                    rootDir: cwd,
                });

                break;
            } catch (error) {
                logger.error(
                    `Failed to load config from ${filePath}: ${parseErrorMessage(error)}`,
                );
            }
        }

        if (configs.length > 0) break;
    }

    return configs;
}
