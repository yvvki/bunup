# Built-in Plugins

Bunup comes with a set of built-in plugins that provide additional functionality without requiring external dependencies. These plugins are designed to solve common bundling challenges and enhance your development workflow.

::: tip
If you have suggestions or ideas for plugins, please [open a new issue](https://github.com/arshad-yaseen/bunup/issues/new).
:::

## `report`

The Report plugin generates a detailed size report of your bundle after each build. It provides information about the size of each output file and can optionally include gzip size information.

### Usage

```ts
import { defineConfig } from 'bunup';
import { report } from 'bunup/plugins';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	plugins: [report()],
});
```

### Options

| Option          | Type      | Default     | Description                                                         |
| --------------- | --------- | ----------- | ------------------------------------------------------------------- |
| `maxBundleSize` | `number`  | `undefined` | Maximum bundle size in bytes. If exceeded, a warning will be shown. |
| `gzip`          | `boolean` | `true`      | Whether to show gzip sizes in the report.                           |

## `shims`

The Shims plugin provides compatibility layers for Node.js globals and ESM/CJS interoperability. It automatically adds appropriate shims when it detects usage of environment-specific features in your code.

### Usage

```ts
import { defineConfig } from 'bunup';
import { shims } from 'bunup/plugins';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	plugins: [shims()],
});
```

For example:

- For CJS output, any `import.meta.url` references are transformed to `pathToFileURL(__filename).href`
- For ESM output, any `__dirname` and `__filename` references are transformed to use `dirname(fileURLToPath(import.meta.url))`

This ensures your code works consistently across different module formats and environments without requiring manual compatibility code.
