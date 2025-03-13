#!/usr/bin/env bun
import { cliCore } from "./cli-core";
import { handleError } from "./errors";

import "./runtime";

cliCore().catch((error) => {
  handleError(error);
  process.exit(1);
});
