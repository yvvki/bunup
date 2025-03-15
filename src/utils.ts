import path from 'path';

import {Format} from './options';

export function splitCommaSeparated(input: string | string[]): string[] {
    return Array.isArray(input) ? input : input.split(',');
}

export function getDefaultOutputExtension(format: Format) {
    switch (format) {
        case 'esm':
            return '.mjs';
        case 'cjs':
            return '.js';
    }
}

export function getDefaultDtsExtention(format: Format) {
    switch (format) {
        case 'esm':
            return '.d.mts';
        case 'cjs':
            return '.d.ts';
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

export function getTempDir(rootDir: string, outDir: string) {
    return path.join(rootDir, outDir, '.bunup');
}

export function getEntryName(entry: string) {
    return entry.split('/').pop()?.split('.').slice(0, -1).join('.') || '';
}
