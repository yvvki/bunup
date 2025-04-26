export type Bundler = {
    name: string;
    buildFn: (options: any) => Promise<undefined | any>;
    options: (dts: boolean) => any;
};
