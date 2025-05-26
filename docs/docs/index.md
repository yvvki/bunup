# Introduction

Bunup is the ⚡️ **blazing-fast build tool** for TypeScript and JavaScript libraries, designed for flawless developer experience and speed, **powered by Bun** — up to **~100× faster than Tsup**.

::: tip 💖
**Building with Bun? You need Bunup.** Designed specifically for the Bun ecosystem with unmatched speed. Bunup is the bundler in your bun stack.
:::

## What Can It Bundle?

Bunup supports bundling for multiple environments — including **Node.js**, **browsers**, and a special **Bun** target. The **bun** target is specifically optimized for libraries intended to run on Bun. It's also perfect for building **React libraries** with its excellent support for JSX/TSX files.

It can bundle JavaScript/TypeScript files (`.js`, `.jsx`, `.ts`, `.tsx`), JSON (`.json`), TOML (`.toml`), text files (`.txt`), and a variety of other assets.

## Scaffold new Project

Quickly scaffold a new modern library with Bunup in just 10 seconds.

::: code-group

```sh [bun]
bunx bunup@latest --new
```

```sh [pnpm]
pnpx bunup@latest --new
```

```sh [npm]
npx bunup@latest --new
```

```sh [yarn]
yarn dlx bunup@latest --new
```

See the [Scaffold with Bunup](./scaffold-with-bunup.md) page for more details.

:::

## Getting Started

Get started with Bunup in seconds - install, configure, and build your TypeScript/JavaScript projects with minimal setup.

### Basic Usage

Create a TypeScript file:

```typescript [src/index.ts]
export function greet(name: string): string {
	return `Hello, ${name}!`;
}
```

Bundle it with bunup:

::: code-group

```sh [bun]
bunx bunup src/index.ts
```

```sh [pnpm]
pnpx bunup src/index.ts
```

```sh [npm]
npx bunup src/index.ts
```

```sh [yarn]
yarn dlx bunup src/index.ts
```

:::

This will create a bundled output in the `dist` directory with CommonJS format (the default).

### Using with package.json

First, install bunup as a dev dependency:

::: code-group

```sh [bun]
bun add --dev bunup
```

```sh [pnpm]
pnpm add --save-dev bunup
```

```sh [npm]
npm install --save-dev bunup
```

```sh [yarn]
yarn add --dev bunup
```

:::

Add a build script to your `package.json`:

```json [package.json]
{
	"name": "my-package",
	"scripts": {
		"build": "bunup src/index.ts --format esm,cjs --dts"
	}
}
```

Then run:

::: code-group

```sh [bun]
bun run build
```

```sh [pnpm]
pnpm build
```

```sh [npm]
npm run build
```

```sh [yarn]
yarn build
```

:::

## Configuration

Create a `bunup.config.ts` file for more control:

```typescript [bunup.config.ts]
import { defineConfig } from 'bunup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
	minify: true,
});
```

You can also export an array of configurations:

```typescript [bunup.config.ts]
export default defineConfig([
	{
		name: 'node',
		entry: ['src/index.ts'],
		format: ['cjs'],
		target: 'node',
	},
	{
		name: 'browser',
		entry: ['src/index.ts'],
		format: ['esm', 'iife'],
		target: 'browser',
	},
]);
```

### Package.json Configuration

You can also include your bunup configuration directly in your `package.json` file using the `bunup` property:

```json [package.json]
{
	"name": "my-package",
	"version": "1.0.0",
	"bunup": {
		"entry": ["src/index.ts"],
		"format": ["esm", "cjs"],
		"dts": true
	}
}
```

This approach can be useful when you prefer keeping all project configuration in a single file.

### JSON Schema

Bunup provides a JSON schema at [https://bunup.dev/schema.json](https://bunup.dev/schema.json) for editor autocompletion and validation. You can enable autocomplete for the `bunup` field in your `package.json` by configuring VSCode:

```json [.vscode/settings.json]
{
  "json.schemas": [
    {
      "fileMatch": ["package.json"],
      "url": "https://bunup.dev/schema.json"
    }
  ]
}
```

This provides autocompletion, validation, and documentation when editing the bunup configuration in your package.json file.

### Custom Configuration Path

If you need to use a configuration file with a non-standard name or location, you can specify its path using the `--config` CLI option:

```sh
bunup --config ./configs/custom.bunup.config.ts
```

This is particularly useful for projects with multiple build configurations or for separating build configs for different environments.

## Watch Mode

Bunup can watch your files for changes and rebuild automatically:

```sh
bunup src/index.ts --watch
```

Or in package.json:

```json [package.json] 5
{
	"name": "my-package",
	"scripts": {
		"build": "bunup src/index.ts",
		"dev": "bunup src/index.ts --watch"
	}
}
```

Then run:

::: code-group

```sh [bun]
bun run dev
```

```sh [pnpm]
pnpm dev
```

```sh [npm]
npm run dev
```

```sh [yarn]
yarn dev
```

:::
