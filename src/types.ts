export type Bun = typeof import('bun');
export type BunBuildOptions = Parameters<Bun['build']>[0];
export type BunPlugin = Exclude<BunBuildOptions['plugins'], undefined>[number];

export type WithOptional<T, K extends keyof T> = Omit<T, K> &
    Partial<Pick<T, K>>;
