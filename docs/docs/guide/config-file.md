# Configuration File

While most build options can be set directly through the CLI, you'll need a configuration file for more advanced scenarios. This includes adding plugins, implementing custom functionality (like post-build operations or style injection functions), or setting up Bunup [workspaces](/docs/guide/workspaces). Since functions cannot be defined using strings in the CLI, a configuration file is essential for these use cases.

To get started, create a `bunup.config.ts` file in your project root:

```typescript [bunup.config.ts]
import { defineConfig } from 'bunup';

export default defineConfig({
	// ...your configuration options go here
});
```

## Multiple Configurations

You can also export an array of configurations for multiple build targets:

```typescript [bunup.config.ts]
export default defineConfig([
	{
		name: 'node',
		format: 'esm',
		target: 'node',
	},
	{
		name: 'browser',
		format: ['esm', 'iife'],
		target: 'browser',
		outDir: 'dist/browser',
	},
]);
```

## Named Configurations

You can give your build configurations names for better logging:

::: code-group

```sh [CLI]
bunup --name my-library
```

```ts [bunup.config.ts]
export default defineConfig({
    name: 'my-library',
});
```

:::

This is especially useful when you have multiple configurations:

```typescript
export default defineConfig([
	{
		name: 'node-build',
		format: 'esm',
		target: 'node',
		// ... other options
	},
	{
		name: 'browser-build',
		format: ['esm', 'iife'],
		// ... other options
	},
]);
```
