import type { DefineWorkspaceEntry } from "bunup";
import { loadConfig } from "coffi";
import type { LoadedConfig } from "./cli";
import type { BunupOptions } from "./options";
import type { Arrayable } from "./types";
import { addField } from "./utils";

export type ProcessableConfig = {
    rootDir: string;
    options: Arrayable<BunupOptions> | Arrayable<Partial<BunupOptions>>;
};

export async function processLoadedConfigs(
    config: LoadedConfig,
    cwd: string,
): Promise<ProcessableConfig[]> {
    return Array.isArray(config) && "root" in config[0]
        ? (config as DefineWorkspaceEntry[]).map((c) => ({
              rootDir: c.root,
              options: addField(
                  c.config,
                  "name",
                  c.name,
              ) as unknown as Arrayable<BunupOptions>,
          }))
        : [
              {
                  rootDir: cwd,
                  options: config as Arrayable<BunupOptions>,
              },
          ];
}

export async function loadPackageJson(cwd: string): Promise<{
    packageJson: Record<string, unknown> | null;
    path: string | null;
}> {
    const { config, filepath } = await loadConfig<Record<string, unknown>>({
        name: "package",
        cwd,
        extensions: [".json"],
        maxDepth: 1,
    });

    return {
        packageJson: config,
        path: filepath,
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
    const { config, filepath } = await loadConfig<Record<string, unknown>>({
        name: "tsconfig",
        cwd: rootDir,
        extensions: [".json"],
        preferredPath: preferredTsconfigPath,
        maxDepth: 3,
    });

    return {
        tsconfig: config,
        path: filepath,
    };
}
