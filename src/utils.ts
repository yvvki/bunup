import fs from 'node:fs';
import path from 'node:path';

import {BunupBuildError} from './errors';
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

export function formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 B';

      const units = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));

      // Format with consistent spacing for unit alignment
      if (i === 0) {
            return bytes < 10
                  ? `${bytes}   ${units[i]}`
                  : bytes < 100
                    ? `${bytes}  ${units[i]}`
                    : `${bytes} ${units[i]}`;
      }

      const formattedSize = (bytes / Math.pow(1024, i)).toFixed(2);
      return `${formattedSize} ${units[i]}`;
}

export function getShortFilePath(filePath: string, maxLength = 3): string {
      const fileParts = filePath.split('/');
      const shortPath = fileParts.slice(-maxLength).join('/');
      return shortPath;
}

export function cleanOutDir(rootDir: string, outdir: string): void {
      const outdirPath = path.join(rootDir, outdir);
      if (fs.existsSync(outdirPath)) {
            try {
                  fs.rmSync(outdirPath, {recursive: true, force: true});
            } catch (error) {
                  throw new BunupBuildError(
                        `Failed to clean output directory: ${error}`,
                  );
            }
      }
      fs.mkdirSync(outdirPath, {recursive: true});
}
