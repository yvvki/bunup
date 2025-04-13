import type { Format, ShimOptions, Target } from "./options";
import { isNodeCompatibleTarget } from "./utils";

interface ShimConfig {
    appliesTo: (format: Format, target: Target) => boolean;
    isNeededInFile: (content: string) => boolean;
    generateCode: () => string;
}

export const SHIMS_REGISTRY: Record<keyof ShimOptions, ShimConfig> = {
    dirnameFilename: {
        appliesTo: (format, target) =>
            format === "esm" && isNodeCompatibleTarget(target),
        isNeededInFile: (content) =>
            /\b__dirname\b/.test(content) || /\b__filename\b/.test(content),
        generateCode: () => `import { fileURLToPath } from 'url';
  import { dirname } from 'path';
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  `,
    },

    importMetaUrl: {
        appliesTo: (format, target) =>
            format === "cjs" && isNodeCompatibleTarget(target),
        isNeededInFile: (content) => /\bimport\.meta\.url\b/.test(content),
        generateCode: () => `import { pathToFileURL } from 'url';
  
  const importMetaUrl = pathToFileURL(__filename).href;
  
  `,
    },
};
