import { logError, logInfo } from "./log";
import { BunupOptions, createBuildOptions } from "./options";

declare const Bun: typeof import("bun");

export async function build(
  options: BunupOptions,
  rootDir: string,
  watch: boolean = false,
) {
  const buildOptions = createBuildOptions(options, rootDir);

  if (watch) {
    logInfo(`Watching ${rootDir}...`);
    Bun.spawn(
      [
        "bun",
        "build",
        ...(buildOptions.entrypoints || []),
        "--outdir",
        buildOptions.outdir || "",
        "--watch",
      ],
      {
        stdout: "inherit",
        stderr: "inherit",
      },
    );
  } else {
    for (const fmt of options.format) {
      const result = await Bun.build({ ...buildOptions, format: fmt });
      if (!result.success) {
        logError("Build failed:");
        result.logs.forEach((log) => console.error(log));
        process.exit(1);
      }
    }

    if (options.dts) {
      logInfo("Generating .d.ts files...");
      await Bun.spawn([
        "tsc",
        "--emitDeclarationOnly",
        "--outDir",
        `${rootDir}/${options.outdir}`,
      ]).exited;
    }

    logInfo(`Built to ${options.outdir}`);
  }
}
