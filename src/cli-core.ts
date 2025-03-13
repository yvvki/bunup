import { build } from "./build";
import { parseCliOptions } from "./cli-options";
import { loadConfigs } from "./config";
import { logInfo } from "./log";
import { DEFAULT_OPTIONS } from "./options";
import { deepObjectMerge } from "./utils";

declare const Bun: typeof import("bun");

export async function cliCore(args: string[] = Bun.argv.slice(2)) {
  const cliOptions = parseCliOptions(args);

  const configs = await loadConfigs(process.cwd());

  logInfo(`Running bunup with Bun v${Bun.version}`);

  if (configs.length === 0) {
    await build(
      deepObjectMerge(DEFAULT_OPTIONS, cliOptions),
      process.cwd(),
      cliOptions.watch,
    );
  } else {
    for (const { options, rootDir } of configs) {
      const mergedConfig = deepObjectMerge(
        DEFAULT_OPTIONS,
        cliOptions,
        options,
      );
      console.log(mergedConfig);
      await build(mergedConfig, rootDir, mergedConfig.watch);
    }
  }
}
