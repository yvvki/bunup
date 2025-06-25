# TypeScript Declarations

Bunup automatically generates TypeScript declaration files (`.d.ts`, `.d.mts`, or `.d.cts` depending on your output format) for your library, making it fully type-safe for consumers.

::: info
Currently, Bunup uses [typeroll](https://github.com/arshad-yaseen/typeroll) for TypeScript declarations generation and bundling until Bun's native bundler supports declaration generation.
:::

::: tip
Before you begin, Optional but recommended, you can enable `"isolatedDeclarations": true` in your `tsconfig.json`.
Bunup uses TypeScript's [isolatedDeclarations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations) feature, which is specially designed for library authors to generate fast, accurate, and robust type definitions.
This setting encourages you to provide explicit type annotations as you write code.
The result? Cleaner, safer, and more reliable type declarations for your library.

```json [tsconfig.json] 4
{
	"compilerOptions": {
		"declaration": true,
		"isolatedDeclarations": true
	}
}
```

:::

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

### Example

::: code-group

```ts [src/types.ts]
export interface User {
  id: string;
  name: string;
}
```

```ts [src/index.ts]
import { User } from './types';

export function getUser(id: string): User {
  return { id, name: 'John' };
}
```

```ts [src/api.ts]
import { User } from './types';

export function createUser(name: string): User {
  return { id: crypto.randomUUID(), name };
}
```

:::

**Without splitting (duplicated types):**

::: code-group

```ts [dist/index.d.ts]
interface User {
  id: string;
  name: string;
}

declare function getUser(id: string): User;

export { getUser };
```

```ts [dist/api.d.ts]
interface User {
  id: string;
  name: string;
}

declare function createUser(name: string): User;

export { createUser };
```

:::

**With splitting (shared types extracted):**

::: code-group

```ts [dist/index.d.ts]
import { User } from './chunk-abc123.js';

declare function getUser(id: string): User;

export { getUser };
```

```ts [dist/api.d.ts]
import { User } from './chunk-abc123.js';

declare function createUser(name: string): User;

export { createUser };
```

```ts [dist/chunk-abc123.d.ts]
interface User {
  id: string;
  name: string;
}

export { User };
```

The result is clean declarations with no duplicates, improved readability, and reduced bundle size.

::: info
Splitting is enabled by default if:
- Using ESM (`format: ['esm']`)
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
