import {logError} from './log';
import {BunupOptions, Format} from './options';
import {Without, WithRequired} from './types';

type CliOptionHandler = (
    value: string | boolean,
    args: Partial<BunupOptions>,
) => void;

const cliOptionAliases: Record<string, keyof BunupOptions> = {
    f: 'format',
    o: 'outdir',
    m: 'minify',
    w: 'watch',
    d: 'dts',
    e: 'external',
    mw: 'minifyWhitespace',
    mi: 'minifyIdentifiers',
    ms: 'minifySyntax',
};

type CliOptionHandlerName = keyof Without<BunupOptions, 'entry'>;

const cliOptionHandlers: Record<CliOptionHandlerName, CliOptionHandler> = {
    format: (value, args) => {
        args.format = (value as string).split(',') as Format[];
    },
    outdir: (value, args) => {
        args.outdir = value as string;
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
};

export function parseCliOptions(argv: string[]): Partial<BunupOptions> {
    const cliOptions: WithRequired<Partial<BunupOptions>, 'entry'> = {
        entry: [],
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg.startsWith('--') || arg.startsWith('-')) {
            const isShortOption = arg.startsWith('-') && !arg.startsWith('--');
            const key = isShortOption ? arg.slice(1) : arg.slice(2);
            const resolvedKey = isShortOption ? cliOptionAliases[key] : key;
            const handler =
                cliOptionHandlers[resolvedKey as CliOptionHandlerName];

            if (!handler) {
                logError(`Unknown option: ${key}`);
                continue;
            }

            const nextArg = argv[i + 1];
            const value = nextArg && !nextArg.startsWith('-') ? nextArg : true;

            handler(value, cliOptions);

            if (typeof value === 'string') {
                i++;
            }
        } else {
            cliOptions.entry.push(arg);
        }
    }

    return cliOptions;
}
