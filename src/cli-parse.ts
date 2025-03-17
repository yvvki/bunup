import {logger} from './logger';
import {BunupOptions, Format, Target} from './options';

type CliOptionHandler = (
    value: string | boolean,
    args: Partial<BunupOptions>,
) => void;

const cliOptionAliases: Record<string, keyof BunupOptions> = {
    n: 'name',
    f: 'format',
    o: 'outDir',
    m: 'minify',
    w: 'watch',
    d: 'dts',
    e: 'external',
    t: 'target',
    mw: 'minifyWhitespace',
    mi: 'minifyIdentifiers',
    ms: 'minifySyntax',
    c: 'clean',
    s: 'splitting',
    ne: 'noExternal',
};

type CliOptionHandlerName = keyof Omit<BunupOptions, 'entry'>;

const cliOptionHandlers: Record<CliOptionHandlerName, CliOptionHandler> = {
    name: (value, args) => {
        args.name = value as string;
    },
    format: (value, args) => {
        args.format = (value as string).split(',') as Format[];
    },
    outDir: (value, args) => {
        args.outDir = value as string;
    },
    minify: (value, args) => {
        args.minify = !!value;
    },
    watch: (value, args) => {
        args.watch = !!value;
    },
    dts: (value, args) => {
        args.dts = !!value;
    },
    external: (value, args) => {
        args.external = (value as string).split(',');
    },
    minifyWhitespace: (value, args) => {
        args.minifyWhitespace = !!value;
    },
    minifyIdentifiers: (value, args) => {
        args.minifyIdentifiers = !!value;
    },
    minifySyntax: (value, args) => {
        args.minifySyntax = !!value;
    },
    target: (value, args) => {
        args.target = value as Target;
    },
    clean: (value, args) => {
        args.clean = !!value;
    },
    splitting: (value, args) => {
        args.splitting = !!value;
    },
    noExternal: (value, args) => {
        args.noExternal = (value as string).split(',');
    },
};

export function parseCliOptions(argv: string[]): Partial<BunupOptions> {
    const cliOptions: Partial<BunupOptions> = {};

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg.startsWith('--') || arg.startsWith('-')) {
            const isShortOption = arg.startsWith('-') && !arg.startsWith('--');
            const key = isShortOption ? arg.slice(1) : arg.slice(2);
            const resolvedKey = isShortOption ? cliOptionAliases[key] : key;
            const handler =
                cliOptionHandlers[resolvedKey as CliOptionHandlerName];

            if (!handler) {
                logger.error(`Unknown option: ${key}`);
                continue;
            }

            const nextArg = argv[i + 1];
            const value = nextArg && !nextArg.startsWith('-') ? nextArg : true;

            handler(value, cliOptions);

            if (typeof value === 'string') {
                i++;
            }
        } else {
            if (!cliOptions.entry) {
                cliOptions.entry = [];
            }
            cliOptions.entry.push(arg);
        }
    }

    return cliOptions;
}
