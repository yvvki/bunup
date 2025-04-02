import fs from 'node:fs/promises';
import path from 'node:path';

import {BunupBuildError} from './errors';
import {DEFAULT_OPTIONS, Format} from './options';

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
): string {
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
): string {
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
): boolean {
      return splitting === undefined ? format === 'esm' : splitting;
}

export function formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 B';

      const units = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));

      if (i === 0) return `${bytes} ${units[i]}`;

      return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function getShortFilePath(filePath: string, maxLength = 3): string {
      const fileParts = filePath.split('/');
      const shortPath = fileParts.slice(-maxLength).join('/');
      return shortPath;
}

export async function cleanOutDir(
      rootDir: string,
      outDir: string,
): Promise<void> {
      const outDirPath = path.join(rootDir, outDir);
      const exists = await fs.exists(outDirPath);
      if (exists) {
            try {
                  await fs.rm(outDirPath, {recursive: true});
            } catch (error) {
                  throw new BunupBuildError(
                        `Failed to clean output directory: ${error}`,
                  );
            }
      }
      await fs.mkdir(outDirPath, {recursive: true});
}

export function getResolvedOutDir(outDir: string | undefined): string {
      return outDir || DEFAULT_OPTIONS.outDir;
}

export function getResolvedClean(clean: boolean | undefined): boolean {
      return clean === undefined ? DEFAULT_OPTIONS.clean : clean;
}
