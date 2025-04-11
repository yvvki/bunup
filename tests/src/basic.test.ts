import { describe, expect, it } from "bun:test";
import { OUT_DIR, findFile, run, validateBuild } from "./run";

describe("bunup basic build", () => {
    it("should build a simple file with ESM format", async () => {
        const result = await run({
            entry: "index.ts",
            outDir: OUT_DIR,
            format: ["esm"],
        });

        expect(result.success).toBe(true);
        expect(result.buildTime).toBeGreaterThan(0);
        expect(result.files.length).toBeGreaterThan(0);

        expect(validateBuild(result, ["index.mjs"])).toBe(true);

        const mainFile = findFile(result, "index", ".mjs");
        expect(mainFile).toBeDefined();
        expect(mainFile?.content).toContain("export");
    });
});
