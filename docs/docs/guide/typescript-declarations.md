# TypeScript Declarations

Bunup automatically generates TypeScript declaration files (`.d.ts`, `.d.mts`, or `.d.cts`) for your library based on your output format, ensuring full type safety for consumers.

Built from the ground up, Bunup includes [its own](https://github.com/bunup/typeroll) high-performance TypeScript declaration bundler. It's designed for maximum speed while offering advanced features like splitting and minification, producing minimal and clean declaration files.

## Prerequisites

Enable `isolatedDeclarations` in your tsconfig:

```json [tsconfig.json] 4
{
	"compilerOptions": {
		"declaration": true,
		"isolatedDeclarations": true
	}
}
```

Bunup leverages TypeScript's new modern [isolatedDeclarations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations) feature (which is specially built for library authors) to generate declaration files quickly. This approach enforces discipline and hygiene in your type exports, ensuring only well-defined, explicit types reach your public API. It's like a TypeScript guardian angel for your library's public surface!

## Basic

If your entry points are TypeScript files, Bunup will automatically generate declaration files for them.

## Custom Entry Points

For more control, you can specify custom entry points for declarations:

```typescript
export default defineConfig({
	entry: ['src/index.ts', 'src/cli.ts'],
	dts: {
		// Only generate declarations for index.ts
		entry: ['src/index.ts'],
	},
});
```

### Using Glob Patterns

Bunup supports glob patterns for both main entries and declaration file entries:

```typescript
export default defineConfig({
	dts: {
		entry: [
			'src/public/**/*.ts',
			'!src/public/dev/**/*'
		]
	}
});
```

You can use:
- Simple patterns like `src/**/*.ts` to include files
- Exclude patterns starting with `!` to filter out specific files
- Both for main entries and declaration entries

## Declaration Splitting

Declaration splitting optimizes TypeScript `.d.ts` files when multiple entry points share types. Instead of duplicating shared types across declaration files, Bunup extracts them into shared chunk files that are imported where needed.

```typescript
export default defineConfig({
	dts: {
		splitting: true,
	},
});
```

**Without splitting:**

```
dist/
├── index.d.ts         # ~45KB
└── cli.d.ts           # ~40KB
```

**With splitting:**

```
dist/
├── index.d.ts         		  # ~15KB, imports from shared chunk
├── cli.d.ts           		  # ~10KB, imports from shared chunk
└── shared/chunk-abc123.d.ts  # ~30KB, shared types
```

The result is clean declarations with no duplicates, improved readability, and reduced bundle size.

<!-- TODO: Uncomment this once Bun fixes the issue with splitting and declaration splitting can be enabled by default when build splitting is enabled
::: info
Declaration splitting is enabled by default if code splitting is enabled.
::: -->

## Minification

You can minify the generated declaration files to reduce their size:

```typescript
export default defineConfig({
	dts: {
		minify: true,
	},
});
```

When enabled, minification preserves public (exported) API names while minifying internal type names and removes documentation comments. This significantly reduces file size when bundle size is a priority and JSDoc comments aren't essential.

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


## TypeScript Configuration

You can specify a custom tsconfig file for declaration generation:

::: code-group

```sh [CLI]
bunup src/index.ts --preferred-tsconfig-path ./tsconfig.build.json
```

```ts [bunup.config.ts]
export default defineConfig({
  entry: ["src/index.ts"],
  preferredTsconfigPath: "./tsconfig.build.json",
});
```

:::

## Resolving External Types

When generating declaration files, you might need to include type references from external dependencies. Bunup can automatically resolve these external types:

::: code-group

```sh [CLI - all packages]
bunup src/index.ts --resolve-dts
```

```sh [CLI - specific packages]
bunup src/index.ts --resolve-dts=react,lodash
```

```ts [bunup.config.ts]
export default defineConfig({
      entry: ['src/index.ts'],
      dts: {
            // Enable resolving all external types
            resolve: true,
      },
});
```

:::

The `resolve` option helps when your TypeScript code imports types from external packages. Bunup will look for type definitions in `node_modules` and include them in your declaration files.

You can also specify which packages to resolve types for:

```typescript
export default defineConfig({
	entry: ['src/index.ts'],
	dts: {
		// Only resolve types from these specific packages
		resolve: ['react', 'lodash', /^@types\//],
	},
});
```

## Disabling Declaration Generation

While Bunup automatically generates declaration files for TypeScript entries, you can disable this feature if needed:

::: code-group

```sh [CLI]
bunup src/index.ts --dts=false
```

```ts [bunup.config.ts]
export default defineConfig({
  entry: ["src/index.ts"],
  dts: false,
});
```

:::

This can be useful when you want to handle declaration generation yourself or when you're working on a project that doesn't need declaration files.
