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

Enabling `isolatedDeclarations` enforces strict discipline in your type exports—only well-defined, explicit types reach your public API. You get bulletproof type safety, fast declarations, and clear interfaces your users will love. It’s like a TypeScript guardian angel for your library’s public surface!

## Basic

To generate declarations for all entry points:

```sh 7
# CLI
bunup src/index.ts --dts

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
});
```

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

```
dist/
├── index.d.ts         # ~15KB, imports from chunk
├── cli.d.ts           # ~10KB, imports from chunk
└── chunk-abc123.d.ts  # ~30KB, shared types
```

The result is clean declarations with no duplicates, improved readability, and reduced bundle size.

::: info
Splitting is enabled by default if:
- Using ESM format
- Code splitting is enabled
:::

## Minification

You can minify the generated declaration files to reduce their size:

```typescript
export default defineConfig({
	dts: {
		minify: true,
	},
});
```

When enabled, minification will preserve public (exported) API names while minifying internal type names to reduce file size. This is particularly useful for large declaration files or multiple medium to large declaration files, which can reduce your bundle size significantly.

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
type e<T>={[P in keyof T]?:e<T[P]>};
interface t<T>{data:T;error?:string;meta?:Record<string,unknown>;}
declare function r<T>(url:string,options?:RequestInit):Promise<t<T>>;
export{r as fetchData,t as Response,e as DeepPartial};
```


## TypeScript Configuration

You can specify a custom tsconfig file for declaration generation:

```sh
# CLI
bunup src/index.ts --dts --preferred-tsconfig-path ./tsconfig.build.json

# Configuration file
export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  preferredTsconfigPath: "./tsconfig.build.json",
});
```

## Resolving External Types

When generating declaration files, you might need to include type references from external dependencies. Bunup can automatically resolve these external types:

```sh
# CLI
bunup src/index.ts --dts --resolve-dts

# CLI (Or specify packages to resolve)
bunup src/index.ts --dts --resolve-dts=react,lodash

# Configuration file
export default defineConfig({
      entry: ['src/index.ts'],
      dts: {
            # Enable resolving all external types
            resolve: true,
      },
});
```

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
