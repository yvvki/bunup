import type { BunPlugin } from "../types";

export function externalPlugin(
    externalPatterns: RegExp[],
    noExternalPatterns: RegExp[],
): BunPlugin {
    return {
        name: "bunup:external-plugin",
        setup(build) {
            build.onResolve({ filter: /.*/ }, (args: { path: string }) => {
                const importPath = args.path;
                const isExternal =
                    externalPatterns.some((re) => re.test(importPath)) &&
                    !noExternalPatterns.some((re) => re.test(importPath));
                if (isExternal) {
                    return {
                        path: importPath,
                        external: true,
                    };
                }
                return null;
            });
        },
    };
}
