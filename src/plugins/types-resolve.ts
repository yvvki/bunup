import path from "node:path";

import { ResolverFactory } from "oxc-resolver";
import type { Plugin } from "rolldown";

import { removeDtsVirtualPrefix } from "../dts/utils";

let resolver: ResolverFactory;

export function typesResolvePlugin(resolvers?: (string | RegExp)[]): Plugin {
    return {
        name: "bunup:types-resolve",
        buildStart() {
            resolver ||= new ResolverFactory({
                mainFields: ["types"],
                conditionNames: ["types", "typings", "import", "require"],
                extensions: [".d.ts", ".ts"],
                modules: ["node_modules", "node_modules/@types"],
            });
        },
        async resolveId(id, importer) {
            const cleanedImporter = importer
                ? removeDtsVirtualPrefix(importer)
                : undefined;

            // skip rollup virtual modules
            if (/\0/.test(id)) return;

            if (resolvers) {
                const shouldResolve = resolvers.some((resolver) => {
                    let rs = false;
                    if (typeof resolver === "string") {
                        rs =
                            resolver === id ||
                            // #1 also resolve modules that are imported by the explicitly specified resolvers
                            // for example, if the user specifies chokidar to be resolved, and chokidar imports readdirp, we should also resolve readdirp even if it's not in the list of explicitly specified resolvers
                            !!cleanedImporter?.includes(resolver);
                    } else {
                        rs =
                            resolver.test(id) ||
                            !!(
                                // #1
                                (
                                    cleanedImporter &&
                                    resolver.test(cleanedImporter)
                                )
                            );
                    }

                    return rs;
                });
                if (!shouldResolve) {
                    return;
                }
            }

            const directory = cleanedImporter
                ? path.dirname(cleanedImporter)
                : process.cwd();

            const { path: resolved } = await resolver.async(directory, id);
            if (!resolved) return;

            if (/[cm]?jsx?$/.test(resolved)) {
                const dts = resolved.replace(/\.([cm]?)jsx?$/, ".d.$1ts");
                return (await Bun.file(dts).exists()) ? dts : undefined;
            }

            return resolved;
        },
    };
}
