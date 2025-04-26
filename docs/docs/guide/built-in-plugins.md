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
