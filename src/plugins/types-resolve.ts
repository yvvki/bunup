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
                mainFields: ["types", "typings", "module", "main"],
                conditionNames: ["types", "typings", "import", "require"],
                extensions: [
                    ".d.ts",
                    ".d.mts",
                    ".d.cts",
                    ".ts",
                    ".mts",
                    ".cts",
                ],
                modules: ["node_modules", "node_modules/@types"],
            });
        },
        async resolveId(id, importer) {
            // skip bun types
            if (id === "bun") return;

            const cleanedImporter = importer
                ? removeDtsVirtualPrefix(importer)
                : undefined;

            // skip rollup virtual modules
            if (/\0/.test(id)) return;

            if (resolvers) {
                const shouldResolve = resolvers.some((resolver) =>
                    typeof resolver === "string"
                        ? resolver === id
                        : resolver.test(id),
                );
                if (!shouldResolve) {
                    return;
                }
            }

            const directory = cleanedImporter
                ? path.dirname(cleanedImporter)
                : process.cwd();

            const { path: resolved } = await resolver.async(directory, id);

            return resolved;
        },
    };
}
