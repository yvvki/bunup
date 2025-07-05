# Introduction

Bunup is the ⚡️ **blazing-fast build tool** for TypeScript and JavaScript libraries, designed for flawless developer experience and speed, **powered by Bun**.

## Performance

**Bunup** delivers instant builds by design. With Bun's native speed and TypeScript's [isolated declarations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations), cold starts and rebuilds are lightning fast—even in monorepos. Say goodbye to slow bundling—this is the future of instant JS/TS packaging.

![Bunup benchmarks](/benchmarks.png)

*The benchmark above shows build times for a project with 1,000 files, functions, and types, with TypeScript declaration generation enabled. For detailed benchmarks, visit [here](https://gugustinette.github.io/bundler-benchmark/)*

## Quick Start

Quickly scaffold a new modern TypeScript or React library with Bunup in just 10 seconds.

```sh
bunx bunup@latest --new
```

See the [Scaffold with Bunup](./scaffold-with-bunup.md) page for more details.

Or, initialize bunup in an existing project:

```sh
bunx bunup@latest --init
```

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

```sh
bunx bunup src/index.ts
```

This will create a bundled output in the `dist` directory with CommonJS format (the default).

### Using with package.json

First, install bunup as a dev dependency:

```sh
bun add --dev bunup
```

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

```sh
bun run build
```

## Configuration

Create a `bunup.config.ts` file for more control:

```typescript [bunup.config.ts]
import { defineConfig } from 'bunup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
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
		outDir: "dist/browser",
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

```sh
bun run dev
```
