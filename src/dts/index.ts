import {loadTsconfig} from '../helpers/load-tsconfig';
import {BunupOptions} from '../options';
import {bundleDtsContent} from './bundler';
import {collectTsFiles} from './collector';
import {generateDtsContent} from './generator';
import {validateInputs} from './validation';

export async function generateDts(
    rootDir: string,
    entry: string,
    options: BunupOptions,
): Promise<string> {
    const {absoluteRootDir, absoluteEntry} = validateInputs(rootDir, entry);
    const tsconfig = loadTsconfig(options.preferredTsconfigPath);
    const tsFiles = await collectTsFiles(absoluteEntry, tsconfig);
    const dtsMap = await generateDtsContent(tsFiles);
    return bundleDtsContent(
        absoluteEntry,
        dtsMap,
        options,
        absoluteRootDir,
        tsconfig,
    );
}
