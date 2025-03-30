import {BunupOptions} from './options';

export type Bun = typeof import('bun');
export type BunBuildOptions = Parameters<Bun['build']>[0];
export type BunPlugin = Exclude<BunBuildOptions['plugins'], undefined>[number];

export type WithOptional<T, K extends keyof T> = Omit<T, K> &
      Partial<Pick<T, K>>;

export type WithRequired<T, K extends keyof T> = Omit<T, K> &
      Required<Pick<T, K>>;

export type DefineConfigOption = WithOptional<
      BunupOptions,
      'outDir' | 'format'
>;
export type DefineConfigOptions = DefineConfigOption | DefineConfigOption[];

export type DefineWorkspaceOptions = {
      name: string;
      root: string;
      config: DefineConfigOptions;
}[];
