import {BunupCLIError} from './errors';
import {logger} from './logger';
import {BunupOptions, Format} from './options';

type CliOptionHandler = (
    value: string | boolean,
    args: Partial<BunupOptions>,
) => void;

function makeBooleanHandler(optionName: keyof BunupOptions): CliOptionHandler {
    return (value, args) => {
        (args as any)[optionName] = value === true ? true : value === 'true';
    };
}

function makeStringHandler(optionName: keyof BunupOptions): CliOptionHandler {
    return (value, args) => {
        if (typeof value === 'string') {
            (args as any)[optionName] = value;
        } else {
            throw new BunupCLIError(
                `Option --${optionName} requires a string value`,
            );
        }
    };
}

function makeArrayHandler(optionName: keyof BunupOptions): CliOptionHandler {
    return (value, args) => {
        if (typeof value === 'string') {
            (args as any)[optionName] = value.split(',');
        } else {
            throw new BunupCLIError(
                `Option --${optionName} requires a string value`,
            );
        }
    };
}

const optionConfigs: Partial<
    Record<keyof BunupOptions, {flags: string[]; handler: CliOptionHandler}>
> = {
    name: {flags: ['n', 'name'], handler: makeStringHandler('name')},
    format: {
        flags: ['f', 'format'],
        handler: (value, args) => {
            if (typeof value === 'string') {
                args.format = value.split(',') as Format[];
            } else {
                throw new BunupCLIError(
                    'Option --format requires a string value',
                );
            }
        },
    },
    outDir: {flags: ['o', 'out-dir'], handler: makeStringHandler('outDir')},
    minify: {flags: ['m', 'minify'], handler: makeBooleanHandler('minify')},
    watch: {flags: ['w', 'watch'], handler: makeBooleanHandler('watch')},
    dts: {flags: ['d', 'dts'], handler: makeBooleanHandler('dts')},
    external: {flags: ['e', 'external'], handler: makeArrayHandler('external')},
    target: {flags: ['t', 'target'], handler: makeStringHandler('target')},
    minifyWhitespace: {
        flags: ['mw', 'minify-whitespace'],
        handler: makeBooleanHandler('minifyWhitespace'),
    },
    minifyIdentifiers: {
        flags: ['mi', 'minify-identifiers'],
        handler: makeBooleanHandler('minifyIdentifiers'),
    },
    minifySyntax: {
        flags: ['ms', 'minify-syntax'],
        handler: makeBooleanHandler('minifySyntax'),
    },
    clean: {flags: ['c', 'clean'], handler: makeBooleanHandler('clean')},
    splitting: {
        flags: ['s', 'splitting'],
        handler: makeBooleanHandler('splitting'),
    },
    noExternal: {
        flags: ['ne', 'no-external'],
        handler: makeArrayHandler('noExternal'),
    },
};

const flagToHandler: Record<string, CliOptionHandler> = {};
for (const config of Object.values(optionConfigs)) {
    if (config) {
        for (const flag of config.flags) {
            flagToHandler[flag] = config.handler;
        }
    }
}

export function getEntryNameOnly(entry: string): string {
    return entry.split('/').pop()?.split('.').slice(0, -1).join('.') || '';
}

export function parseCliOptions(argv: string[]): Partial<BunupOptions> {
    const cliOptions: Partial<BunupOptions> = {};
    const entries: Record<string, string> = {};

    let i = 0;
    while (i < argv.length) {
        const arg = argv[i];

        if (arg.startsWith('--')) {
            let key: string;
            let value: string | boolean;

            if (arg.includes('=')) {
                const [keyPart, valuePart] = arg.slice(2).split('=', 2);
                key = keyPart;
                value = valuePart;
            } else {
                key = arg.slice(2);
                const nextArg = argv[i + 1];
                value = nextArg && !nextArg.startsWith('-') ? nextArg : true;
                if (typeof value === 'string') i++;
            }

            if (key === 'entry') {
                if (typeof value === 'string') {
                    const name = getEntryNameOnly(value);
                    if (entries[name]) {
                        logger.warn(
                            `Duplicate entry name '${name}' derived from '${value}'. Overwriting previous entry.`,
                        );
                    }
                    entries[name] = value;
                } else {
                    throw new BunupCLIError(
                        'Option --entry requires a string value',
                    );
                }
            } else if (key.startsWith('entry.')) {
                const name = key.slice(6);
                if (typeof value === 'string') {
                    if (entries[name]) {
                        logger.warn(
                            `Duplicate entry name '${name}' provided via --entry.${name}. Overwriting previous entry.`,
                        );
                    }
                    entries[name] = value;
                } else {
                    throw new BunupCLIError(
                        `Option --entry.${name} requires a string value`,
                    );
                }
            } else {
                const handler = flagToHandler[key];
                if (handler) {
                    handler(value, cliOptions);
                } else {
                    throw new BunupCLIError(`Unknown option: --${key}`);
                }
            }
        } else if (arg.startsWith('-')) {
            const key = arg.slice(1);
            const nextArg = argv[i + 1];
            const value = nextArg && !nextArg.startsWith('-') ? nextArg : true;
            if (typeof value === 'string') i++;

            const handler = flagToHandler[key];
            if (handler) {
                handler(value, cliOptions);
            } else {
                throw new BunupCLIError(`Unknown option: -${key}`);
            }
        } else {
            const name = getEntryNameOnly(arg);
            if (entries[name]) {
                logger.warn(
                    `Duplicate entry name '${name}' derived from positional argument '${arg}'. Overwriting previous entry.`,
                );
            }
            entries[name] = arg;
        }

        i++;
    }

    if (Object.keys(entries).length > 0) {
        cliOptions.entry = entries;
    }

    return cliOptions;
}
