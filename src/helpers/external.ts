import type { BunupOptions } from "../options";
import { escapeRegExp, getPackageDeps } from "../utils";

function processPatterns(patterns: (string | RegExp)[]): RegExp[] {
    return patterns.map((pattern) =>
        typeof pattern === "string"
            ? new RegExp(`^${escapeRegExp(pattern)}($|\\/|\\\\)`)
            : pattern,
    );
}

export function getExternalPatterns(
    options: BunupOptions,
    packageJson: Record<string, unknown> | null,
): RegExp[] {
    return processPatterns(options.external || []).concat(
        getPackageDeps(packageJson).map(
            (dep) => new RegExp(`^${escapeRegExp(dep)}($|\\/|\\\\)`),
        ),
    );
}

export function getNoExternalPatterns(options: BunupOptions): RegExp[] {
    return processPatterns(options.noExternal || []);
}
