import {BunupOptions} from './options';

export type PromiseOr<T> = Promise<T> | T;

export type WithOptional<T, K extends keyof T> = Omit<T, K> &
      Partial<Pick<T, K>>;

export type WithRequired<T, K extends keyof T> = Omit<T, K> &
      Required<Pick<T, K>>;

export type Bun = typeof import('bun');
export type BunBuildOptions = Parameters<Bun['build']>[0];
export type BunPlugin = Exclude<BunBuildOptions['plugins'], undefined>[number];

export type DefineConfigEntry = Omit<
      WithOptional<BunupOptions, 'outDir' | 'format'>,
      'watch'
>;

export type DefineWorkspaceEntry = {
      name: string;
      root: string;
      config: DefineConfigEntry | DefineConfigEntry[];
};
