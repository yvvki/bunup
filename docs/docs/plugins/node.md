# Node Plugins

Node plugins provide seamless integration with Node.js environments by handling Node-specific features and functionality automatically.

::: tip
If you have suggestions or ideas for Node plugins, please [open a new issue](https://github.com/arshad-yaseen/bunup/issues/new).
:::

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
