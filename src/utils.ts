import {Format} from './options';

export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function generateRandomSuffix(length = 8): string {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}

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

export function isModulePackage(packageType: string | undefined) {
    return packageType === 'module';
}

export function formatTime(ms: number): string {
    return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

export function getPackageDeps(
    packageJson: Record<string, unknown> | null,
): string[] {
    if (!packageJson) return [];

    return Array.from(
        new Set([
            ...Object.keys(packageJson.dependencies || {}),
            ...Object.keys(packageJson.peerDependencies || {}),
        ]),
    );
}

// If splitting is undefined, it will be true if the format is esm
export function getResolvedSplitting(
    splitting: boolean | undefined,
    format: Format,
) {
    return splitting === undefined ? format === 'esm' : splitting;
}
