import { resolve } from "node:path";

export const TEST_DIR = resolve(process.cwd(), "tests");
export const PROJECT_DIR = resolve(TEST_DIR, ".project");
export const OUTPUT_DIR = resolve(TEST_DIR, PROJECT_DIR, ".output");
