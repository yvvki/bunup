import path from "node:path";
import { loadConfig } from "unconfig";
import type { LoadedConfig } from "./cli";
import type { BuildOptions } from "./options";
import type { Arrayable, DefineWorkspaceItem } from "./types";
import { addField } from "./utils";

export type ProcessableConfig = {
    rootDir: string;
    options: Arrayable<BuildOptions> | Arrayable<Partial<BuildOptions>>;
};

export async function processLoadedConfigs(
    config: LoadedConfig,
    cwd: string,
    filter?: string[],
): Promise<ProcessableConfig[]> {
    return Array.isArray(config) && "root" in config[0]
        ? (config as DefineWorkspaceItem[])
              .filter((c) => (filter ? filter.includes(c.name) : true))
              .map((c) => ({
                  rootDir: path.resolve(cwd, c.root),
                  options: addField(
                      c.config,
                      "name",
                      c.name,
                  ) as unknown as Arrayable<BuildOptions>,
              }))
        : [
              {
                  rootDir: cwd,
                  options: config as Arrayable<BuildOptions>,
              },
          ];
}

export async function loadPackageJson(cwd: string): Promise<{
    packageJson: Record<string, unknown> | null;
    path: string | null;
}> {
    const { config, sources } = await loadConfig<Record<string, unknown>>({
        sources: [
            {
                files: "package.json",
                extensions: [],
            },
        ],
        cwd,
    });

    return {
        packageJson: config,
        path: sources?.[0],
    };
}

export type TsConfigData = {
    tsconfig: Record<string, unknown> | null;
    path: string | null;
};

export async function loadTsconfig(
    rootDir: string,
    preferredTsconfigPath: string | undefined,
): Promise<TsConfigData> {
    const { config, sources } = await loadConfig<Record<string, unknown>>({
        sources: preferredTsconfigPath
            ? [
                  {
                      files: preferredTsconfigPath,
                      extensions: [],
                  },
              ]
            : [
                  {
                      files: "tsconfig.json",
                      extensions: [],
                  },
              ],
        cwd: rootDir,
    });

    return {
        tsconfig: config,
        path: sources?.[0],
    };
}
