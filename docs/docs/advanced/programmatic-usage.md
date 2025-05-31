# Programmatic Usage

Bunup can be used programmatically in your scripts. This is useful when you need custom build workflows or want to integrate bunup into your own tools.

::: info
The build function must be run in the Bun runtime.
:::

## Basic Usage

```typescript
import { build } from 'bunup';

await build({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  dts: true
});
```

## Options

The build function accepts the same options as `defineConfig`. See the [Options Guide](/docs/guide/options) for detailed documentation of all available options.

For TypeScript users, the `BuildOptions` type is available:

```typescript
import { build, type BuildOptions } from 'bunup';

const options: BuildOptions = {
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  dts: true
};

await build(options);
```

The full type definition can be found in the [bunup source code](https://github.com/arshad-yaseen/bunup/blob/main/src/options.ts#L56).
