import type { BunPlugin } from "bun";
import type { Format, Shims, Target } from "../options";
import { isNodeCompatibleTarget } from "../utils";

interface InjectShimsPluginOptions {
    format: Format;
    target: Target;
    shims?: Shims;
}

function extractShebang(content: string): {
    shebangLine: string;
    codeContent: string;
} {
    if (!content.startsWith("#!")) {
        return { shebangLine: "", codeContent: content };
    }

    const newlineIndex = content.indexOf("\n");
    if (newlineIndex === -1) {
        return { shebangLine: "", codeContent: content };
    }

    return {
        shebangLine: content.substring(0, newlineIndex + 1),
        codeContent: content.substring(newlineIndex + 1),
    };
}

export function injectShimsPlugin(
    options: InjectShimsPluginOptions,
): BunPlugin {
    const { format, target } = options;
    const inject =
        options.shims === true
            ? { dirname: true, filename: true, importMetaUrl: true }
            : options.shims || {};

    return {
        name: "inject-shims",
        setup(build) {
            if (format === "esm" && isNodeCompatibleTarget(target)) {
                build.onLoad(
                    { filter: /\.(js|ts|jsx|tsx|mts|cts)$/ },
                    async (args) => {
                        const content = await Bun.file(args.path).text();

                        if (!inject.dirname && !inject.filename) {
                            return;
                        }

                        const needsDirname =
                            inject.dirname && /\b__dirname\b/.test(content);
                        const needsFilename =
                            inject.filename && /\b__filename\b/.test(content);

                        if (!needsDirname && !needsFilename) {
                            return;
                        }

                        const { shebangLine, codeContent } =
                            extractShebang(content);
                        let esmShim = "";

                        if (needsDirname || needsFilename) {
                            esmShim += `import { fileURLToPath } from 'url';\nimport { dirname } from 'path';\n\n`;

                            if (needsFilename) {
                                esmShim +=
                                    "const __filename = fileURLToPath(import.meta.url);\n";
                            }

                            if (needsDirname) {
                                if (needsFilename) {
                                    esmShim +=
                                        "const __dirname = dirname(__filename);\n";
                                } else {
                                    esmShim +=
                                        "const __dirname = dirname(fileURLToPath(import.meta.url));\n";
                                }
                            }

                            esmShim += "\n";
                        }

                        return {
                            contents: shebangLine + esmShim + codeContent,
                        };
                    },
                );
            } else if (format === "cjs" && isNodeCompatibleTarget(target)) {
                build.onLoad(
                    { filter: /\.(js|ts|jsx|tsx|mts|cts)$/ },
                    async (args) => {
                        const content = await Bun.file(args.path).text();

                        if (!inject.importMetaUrl) {
                            return;
                        }

                        const needsImportMetaUrl = /\bimport\.meta\.url\b/.test(
                            content,
                        );
                        if (!needsImportMetaUrl) {
                            return;
                        }

                        const { shebangLine, codeContent } =
                            extractShebang(content);
                        const cjsShim = `import { pathToFileURL } from 'url';\n\nconst importMetaUrl = pathToFileURL(__filename).href;\n\n`;

                        return {
                            contents: shebangLine + cjsShim + codeContent,
                        };
                    },
                );
            }
        },
    };
}
