# Productivity Plugins

Productivity plugins make library building easier and more efficient, allowing you to focus exclusively on your code.

::: tip
If you have suggestions or ideas for Productivity plugins, please [open a new issue](https://github.com/arshad-yaseen/bunup/issues/new).
:::

## `exports`

This plugin automatically generates and updates the `exports` field in your package.json file after each build. 

Bunup handles mapping all entry points to their corresponding output files, including ESM/CJS formats and type declarations. The exports field stays perfectly in sync with your build configuration always - no manual updates needed when do any change to config.

### Usage

```ts
import { defineConfig } from 'bunup';
import { exports } from 'bunup/plugins';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	plugins: [exports()],
});
```

## `copy`

This plugin copies files and directories to the output directory after each build. It supports glob patterns for flexible file selection. If no destination is specified, files are copied to the build output directory.

### Usage

```ts
import { defineConfig } from 'bunup';
import { copy } from 'bunup/plugins';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	plugins: [copy(['README.md', 'assets/**/*'])],
});
```

**Basic copying:**
```ts
copy(['README.md', 'assets/**/*'])
```

**Copy and rename a file:**
```ts
copy(['README.md'], 'dist/documentation.md')
```

**Copy to a specific directory:**
```ts
copy(['assets/**/*'], 'dist/static')
```
