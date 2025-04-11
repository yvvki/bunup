import fs from "node:fs/promises";
import { cleanOutputDir } from "./utils";

cleanOutputDir();

await fs.writeFile(
    "tests/fixtures/package.json",
    JSON.stringify({ name: "bunup-test-fixtures" }, null, 2),
);
