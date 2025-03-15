import path from 'path';

import {Format} from './options';

export function splitCommaSeparated(input: string | string[]): string[] {
    return Array.isArray(input) ? input : input.split(',');
}

export function getDefaultOutputExtension(
    format: Format,
    packageType: string | undefined,
) {
    switch (format) {
        case 'esm':
            return '.mjs';
        case 'cjs':
            return packageType === 'module' ? '.cjs' : '.js';
    }
}

export function getDefaultDtsExtention(
    format: Format,
    packageType: string | undefined,
) {
    switch (format) {
        case 'esm':
            return '.d.mts';
        case 'cjs':
            return packageType === 'module' ? '.d.cts' : '.d.ts';
    }
}

export function cleanJsonString(json: string): string {
    return json
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .trim();
}

export function getBunupTempDir(rootDir: string, outDir: string) {
    return path.join(rootDir, outDir, '.bunup');
}

export function getDtsTempDir(entryName: string, format: Format) {
    return path.join(entryName, format);
}

export function getEntryName(entry: string) {
    return entry.split('/').pop()?.split('.').slice(0, -1).join('.') || '';
}
