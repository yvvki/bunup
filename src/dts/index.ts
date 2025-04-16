import type { TsConfigData } from "../loaders";
import type { BuildOptions } from "../options";
import { bundleDts } from "./bundler";
import { collectTsFiles } from "./collector";
import { generateDtsContent } from "./generator";
import { validateInputs } from "./validation";

export async function generateDts(
    rootDir: string,
    entry: string,
    options: BuildOptions,
    tsconfig: TsConfigData,
    packageJson: Record<string, unknown> | null,
): Promise<string> {
    const { absoluteEntry } = await validateInputs(rootDir, entry);
    const tsFiles = await collectTsFiles(absoluteEntry, tsconfig, rootDir);
    const dtsMap = await generateDtsContent(tsFiles);
    return bundleDts(
        absoluteEntry,
        dtsMap,
        options,
        packageJson,
        tsconfig,
        rootDir,
    );
}
