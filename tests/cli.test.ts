import { describe, expect, it } from "vitest";
import { parseCliOptions } from "../src/cli-parse";

describe("CLI Parsing", () => {
    it("parses positional entry", () => {
        const options = parseCliOptions(["src/index.ts"]);
        expect(options.entry).toEqual({ index: "src/index.ts" });
    });
    it("parses --entry", () => {
        const options = parseCliOptions(["--entry", "src/index.ts"]);
        expect(options.entry).toEqual({ index: "src/index.ts" });
    });
    it("parses --entry.name", () => {
        const options = parseCliOptions(["--entry.main", "src/index.ts"]);
        expect(options.entry).toEqual({ main: "src/index.ts" });
    });
    it("parses format", () => {
        const options = parseCliOptions(["--format", "esm,cjs"]);
        expect(options.format).toEqual(["esm", "cjs"]);
    });
    it("parses boolean flags", () => {
        const options = parseCliOptions(["--minify"]);
        expect(options.minify).toBe(true);
    });
    it("parses external", () => {
        const options = parseCliOptions(["--external", "chalk,lodash"]);
        expect(options.external).toEqual(["chalk", "lodash"]);
    });
    it("handles dts resolve", () => {
        const options = parseCliOptions(["--dts", "--resolve-dts", "chalk"]);
        expect(options.dts).toEqual({ resolve: ["chalk"] });
    });
    it("throws on unknown option", () => {
        expect(() => parseCliOptions(["--unknown"])).toThrow(
            "Unknown option: --unknown",
        );
    });
    it("parses multiple entries", () => {
        const options = parseCliOptions(["src/index.ts", "src/utils.ts"]);
        expect(options.entry).toEqual({
            index: "src/index.ts",
            utils: "src/utils.ts",
        });
    });
    it("handles short flags", () => {
        const options = parseCliOptions(["-f", "esm"]);
        expect(options.format).toEqual(["esm"]);
    });
});
