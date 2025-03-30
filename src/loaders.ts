import fs from 'node:fs';
import path from 'node:path';

import {BunupBuildError, parseErrorMessage} from './errors';
import {logger} from './logger';
import {BunupOptions} from './options';

export async function loadConfigs(cwd: string): Promise<{
      configs: {options: BunupOptions; rootDir: string}[];
      configFilePath: string;
}> {
      const supportedExtensions = [
            '.ts',
            '.js',
            '.mjs',
            '.cjs',
            '.mts',
            '.cts',
            '.json',
            '.jsonc',
      ];

      for (const ext of supportedExtensions) {
            const filePath = path.join(cwd, `bunup.config${ext}`);

            try {
                  if (!fs.existsSync(filePath)) continue;

                  const content = await loadConfigFile(filePath, ext);
                  if (!content) continue;

                  const configs = processConfigContent(content, cwd);

                  return {
                        configs,
                        configFilePath: filePath,
                  };
            } catch (error) {
                  throw new BunupBuildError(
                        `Failed to load config from ${filePath}: ${parseErrorMessage(error)}`,
                  );
            }
      }

      return {
            configs: [],
            configFilePath: '',
      };
}

async function loadConfigFile(filePath: string, ext: string): Promise<any> {
      if (ext === '.json' || ext === '.jsonc') {
            return loadJsonConfig(filePath);
      }

      return loadJsConfig(filePath);
}

function loadJsonConfig(filePath: string): any {
      try {
            const text = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(text);

            return parsed.bunup || parsed;
      } catch (error) {
            throw new Error(
                  `Invalid JSON in config file. ${parseErrorMessage(error)}`,
            );
      }
}

async function loadJsConfig(filePath: string): Promise<any> {
      try {
            const imported = await import(`file://${filePath}`);
            const content = imported.default || imported;

            if (!content) {
                  logger.warn(
                        `No export found in ${filePath}. Make sure you're exporting your configuration.`,
                  );
                  return {};
            }

            return content;
      } catch (error) {
            throw new Error(
                  `Failed to import config file. ${parseErrorMessage(error)}`,
            );
      }
}

function processConfigContent(
      content: any,
      cwd: string,
): {options: BunupOptions; rootDir: string}[] {
      const configs: {options: BunupOptions; rootDir: string}[] = [];

      if (isWorkspaceConfig(content)) {
            processWorkspaceConfig(content, cwd, configs);
      } else if (Array.isArray(content)) {
            processConfigArray(content, cwd, configs);
      } else if (content && typeof content === 'object') {
            configs.push({
                  options: content,
                  rootDir: cwd,
            });
      } else {
            throw new Error(
                  'Invalid configuration format. Expected an object, array, or workspace configuration.',
            );
      }

      return configs;
}

function isWorkspaceConfig(content: any): boolean {
      return (
            Array.isArray(content) &&
            content.length > 0 &&
            content.every(
                  item =>
                        typeof item === 'object' &&
                        item !== null &&
                        'name' in item &&
                        'root' in item &&
                        'config' in item,
            )
      );
}

function processWorkspaceConfig(
      workspaces: any[],
      cwd: string,
      configs: {options: BunupOptions; rootDir: string}[],
): void {
      for (const workspace of workspaces) {
            const workspaceRoot = path.resolve(cwd, workspace.root);

            if (Array.isArray(workspace.config)) {
                  for (const item of workspace.config) {
                        configs.push({
                              options: {
                                    name: workspace.name,
                                    ...item,
                              },
                              rootDir: workspaceRoot,
                        });
                  }
            } else {
                  configs.push({
                        options: {
                              name: workspace.name,
                              ...workspace.config,
                        },
                        rootDir: workspaceRoot,
                  });
            }
      }
}

function processConfigArray(
      configArray: any[],
      cwd: string,
      configs: {options: BunupOptions; rootDir: string}[],
): void {
      for (const item of configArray) {
            if (!item || typeof item !== 'object') {
                  throw new Error(
                        'Invalid configuration item. Expected an object.',
                  );
            }

            configs.push({
                  options: item,
                  rootDir: cwd,
            });
      }
}

export function loadPackageJson(cwd: string): Record<string, unknown> | null {
      const packageJsonPath = path.join(cwd, 'package.json');

      try {
            if (!fs.existsSync(packageJsonPath)) {
                  return null;
            }

            const text = fs.readFileSync(packageJsonPath, 'utf8');
            const content = JSON.parse(text);

            return content;
      } catch (error) {
            logger.warn(
                  `Failed to load package.json at ${packageJsonPath}: ${parseErrorMessage(error)}`,
            );
            return null;
      }
}
