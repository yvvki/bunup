# TypeScript Declarations

Bunup automatically generates TypeScript declaration files (`.d.ts`, `.d.mts`, or `.d.cts`) for your library based on your output format, with advanced features like declaration splitting.

## Isolated Declarations

Enable `isolatedDeclarations` in your tsconfig:

```json [tsconfig.json] {3-4}
{
  "compilerOptions": {
    "declaration": true,
    "isolatedDeclarations": true
  }
}
```

TypeScript 5.5's [isolated declarations](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5-beta/#isolated-declarations) eliminates slow declaration generation by processing files independently rather than analyzing entire dependency graphs. By requiring explicit return types on public exports only, it transforms builds from seconds/minutes to milliseconds (**50-100x faster**), enabling instant builds and faster iteration. This creates clearer, predictable APIs defined by you instead of TypeScript's inference, while ensuring compatibility with next-generation build tools for the modern JavaScript ecosystem.

Learn more about isolated declarations [here](https://arshadyaseen.com/writing/isolated-declarations).

For new projects, we strongly recommend enabling isolated declarations to achieve instant builds, clearer APIs, and ensure your library remains compatible with future JavaScript tooling.

For some projects (though uncommon), you might need to disable isolated declarations when you rely on TypeScript's type inference. This is particularly relevant when working with complex generic types that depend heavily on inference. In such cases, explicitly annotating return types for all public exports might be challenging or verbose. Check the [Infer Types](#infer-types) section for more details.

## Basic

Bunup automatically generates TypeScript declaration files for all TypeScript entry points that require them. Files that do not contain exports, or for which declarations are unnecessary, are skipped.

## Declaration Splitting

Declaration splitting optimizes TypeScript `.d.ts` files when multiple entry points share types. Instead of duplicating shared types across declaration files, Bunup extracts them into shared chunk files that are imported where needed.

::: code-group

```sh [CLI]
bunup --dts.splitting
```

```typescript [bunup.config.ts]
export default defineConfig({
	dts: {
		splitting: true,
	},
});
```

:::

**Without splitting:**

```
dist/
├── index.d.ts           # ~45KB
└── utils.d.ts           # ~40KB
```

**With splitting:**

```
dist/
├── index.d.ts					# ~15KB, imports from shared chunk
├── utils.d.ts					# ~10KB, imports from shared chunk
└── shared/chunk-abc123.d.ts	# ~30KB, shared types
```

The result is clean declarations with no duplicates, improved readability, and reduced bundle size.

<!-- TODO: Uncomment this once Bun fixes the issue with splitting and declaration splitting can be enabled by default when build splitting is enabled
::: info
Declaration splitting is enabled by default if code splitting is enabled.
::: -->

## Minification

You can minify the generated declaration files to reduce their size:

::: code-group

```sh [CLI]
bunup --dts.minify
```

```typescript [bunup.config.ts]
export default defineConfig({
	dts: {
		minify: true,
	},
});
```

:::

Minifying TypeScript declarations is uncommon, but bunup supports it. When enabled, minification keeps public (exported) API names intact, shortens internal type names, and removes documentation comments. This can greatly reduce file size, which is useful if bundle size matters and you don't need JSDoc or readable type definitions for consumers.

### Example

**Original:**

```ts
type DeepPartial<T> = { [P in keyof T]? : DeepPartial<T[P]> };
interface Response<T> {
	data: T;
	error?: string;
	meta?: Record<string, unknown>;
}
declare function fetchData<T>(url: string, options?: RequestInit): Promise<Response<T>>;
export { fetchData, Response, DeepPartial };
```

**Minified:**

```ts
type e<T>={[P in keyof T]?:e<T[P]>};interface t<T>{data:T;error?:string;meta?:Record<string,unknown>;}declare function n<T>(url:string,options?:RequestInit): Promise<t<T>>;export{n as fetchData,t as Response,e as DeepPartial};
```

## Infer Types

By default, Bunup uses TypeScript's isolated declarations mode, which requires explicit type annotations on public exports. While this provides excellent performance and clearer APIs, some projects may rely heavily on TypeScript's type inference for complex generic types (like working with Zod in your project).

The `inferTypes` option uses the TypeScript native compiler via [tsgo](https://github.com/microsoft/typescript-go) to generate declarations, which will infer types for you automatically. This eliminates the need for explicit return type annotations while still maintaining excellent performance (10x faster than traditional `tsc`).

First, you need to install the `@typescript/native-preview` package:

```sh
bun add --dev @typescript/native-preview
```

Then, you can enable the `inferTypes` option:

::: code-group

```sh [CLI]
bunup --dts.infer-types
```

```typescript [bunup.config.ts]
export default defineConfig({
	dts: {
		inferTypes: true,
	},
});
```

:::

::: tip
For new projects, it's recommended to use [isolated declarations](#prerequisites) (default behavior) without `inferTypes`. This provides the best performance and encourages clearer, more maintainable APIs through explicit type annotations.
:::

## Custom Entry Points

For more control, you can specify custom entry points for declarations:

::: code-group

```sh [CLI]
# Single entry
bunup src/index.ts src/utils.ts --dts.entry src/index.ts

# Multiple entries
bunup src/index.ts src/utils.ts src/types.ts --dts.entry src/index.ts,src/types.ts
```

```typescript [bunup.config.ts]
export default defineConfig({
	entry: ['src/index.ts', 'src/utils.ts'],
	dts: {
		// Only generate declarations for index.ts
		entry: ['src/index.ts'],
	},
});
```

:::

### Using Glob Patterns

Bunup supports glob patterns for both main entries and declaration file entries:

::: code-group

```sh [CLI]
# Single glob pattern
bunup --dts.entry "src/public/**/*.ts"

# Multiple patterns (including exclusions)
bunup --dts.entry "src/public/**/*.ts,!src/public/dev/**/*"
```

```typescript [bunup.config.ts]
export default defineConfig({
	dts: {
		entry: [
			'src/public/**/*.ts',
			'!src/public/dev/**/*'
		]
	}
});
```

:::

You can use:
- Simple patterns like `src/**/*.ts` to include files
- Exclude patterns starting with `!` to filter out specific files
- Both for main entries and declaration entries


## TypeScript Configuration

You can specify a custom tsconfig file to use for TypeScript declaration generation. This is mainly used for path resolution during declaration generation.

See [Custom Tsconfig Path](/docs/guide/options#custom-tsconfig-path) for details.

By default, the nearest `tsconfig.json` file will be used.

## Resolving External Types

When generating declaration files, you might need to include type references from external dependencies. Bunup can automatically resolve these external types:

::: code-group

```sh [CLI]
# Enable resolving all external types
bunup --dts.resolve
```

```ts [bunup.config.ts]
export default defineConfig({
      dts: {
            // Enable resolving all external types
            resolve: true,
      },
});
```

:::

The `resolve` option helps when your TypeScript code imports types from external packages. Bunup will look for type definitions in `node_modules` and include them in your declaration files.

You can also specify which packages to resolve types for:

::: code-group

```sh [CLI]
# Single package
bunup --dts.resolve react

# Multiple packages
bunup --dts.resolve react,lodash,@types/node
```

```typescript [bunup.config.ts]
export default defineConfig({
	dts: {
		// Only resolve types from these specific packages
		resolve: ['react', 'lodash', /^@types\//],
	},
});
```

:::

## Disabling Declaration Generation

While Bunup automatically generates declaration files for TypeScript entries, you can disable this feature if needed:

::: code-group

```sh [CLI]
bunup --no-dts
```

```ts [bunup.config.ts]
export default defineConfig({
  entry: "src/index.ts",
  dts: false,
});
```

:::

This can be useful when you want to handle declaration generation yourself or when you're working on a project that doesn't need declaration files.
