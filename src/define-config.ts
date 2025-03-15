import {BunupOptions} from './options';
import {WithOptional} from './types';

type DefineConfigOptions = WithOptional<BunupOptions, 'outDir' | 'format'>;

export function defineConfig(
    options: DefineConfigOptions,
): DefineConfigOptions {
    return options;
}
