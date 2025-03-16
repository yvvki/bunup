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
            return isModulePackage(packageType) ? '.cjs' : '.js';
        case 'iife':
            return '.global.js';
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
            return isModulePackage(packageType) ? '.d.cts' : '.d.ts';
        case 'iife':
            return '.d.ts';
    }
}

export function getEntryNamingFormat(extension: string) {
    return `[dir]/[name]${extension}`;
}

export function cleanJsonString(json: string): string {
    return json
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .trim();
}

export function isModulePackage(packageType: string | undefined) {
    return packageType === 'module';
}

export function getEntryNameOnly(entry: string) {
    return entry.split('/').pop()?.split('.').slice(0, -1).join('.') || '';
}

export function formatTime(ms: number): string {
    return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}
