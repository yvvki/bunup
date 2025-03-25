import {BunupOptions} from './options';
import {WithOptional} from './types';

type DefineConfigOption = WithOptional<BunupOptions, 'outDir' | 'format'>;
type DefineConfigOptions = DefineConfigOption | DefineConfigOption[];

export function defineConfig(
      options: DefineConfigOptions,
): DefineConfigOptions {
      return options;
}
