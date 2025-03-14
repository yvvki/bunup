import {sep} from 'path';

import {Format} from './options';

// https://github.com/novemberborn/common-path-prefix/blob/master/index.js
//https://github.com/wobsoriano/bun-plugin-dts/blob/main/src/index.ts
export const determineSeparator = (paths: string[]): string => {
    for (const path of paths) {
        const match = /(\/|\\)/.exec(path);
        if (match !== null) return match[0];
    }

    return sep;
};

export const commonPathPrefix = (paths: string[], sep: string) => {
    const [first = '', ...remaining] = paths;
    if (first === '' || remaining.length === 0) return '';

    const parts = first.split(sep);

    let endOfPrefix = parts.length;
    for (const path of remaining) {
        const compare = path.split(sep);
        for (let i = 0; i < endOfPrefix; i++) {
            if (compare[i] !== parts[i]) {
                endOfPrefix = i;
            }
        }

        if (endOfPrefix === 0) return '';
    }

    const prefix = parts.slice(0, endOfPrefix).join(sep);
    return prefix.endsWith(sep) ? prefix : prefix + sep;
};
//

export const getDefaultExtension = (format: Format) => {
    switch (format) {
        case 'esm':
            return '.mjs';
        case 'cjs':
            return '.js';
    }
};

export const getEntryName = (entry: string) => {
    return entry.split('/').pop()?.split('.').slice(0, -1).join('.') || '';
};
