# Introduction

Bunup is the ⚡️ **blazing-fast build tool** for TypeScript libraries, designed for flawless developer experience and speed, **powered by Bun**.

## Performance

**Bunup** delivers instant builds by design. With Bun's native speed and [Bunup's high-performance dts bundler](https://github.com/bunup/typeroll), builds and rebuilds are lightning fast, even in monorepos. See [benchmarks](https://gugustinette.github.io/bundler-benchmark/).

<div style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;" aria-hidden="false">
<table>
<thead>
<tr>
<th>Tool</th>
<th>Build Time (s)</th>
<th>Relative Speed</th>
</tr>
</thead>
<tbody>
<tr>
<td>bunup</td>
<td>0.37 s</td>
<td>baseline</td>
</tr>
<tr>
<td>tsdown</td>
<td>0.41 s</td>
<td>1.11× slower</td>
</tr>
<tr>
<td>rslib</td>
<td>1.41 s</td>
<td>3.81× slower</td>
</tr>
<tr>
<td>unbuild</td>
<td>3.19 s</td>
<td>8.62× slower</td>
</tr>
<tr>
<td>tsup</td>
<td>3.37 s</td>
<td>9.11× slower</td>
</tr>
</tbody>
</table>
</div>

## Quick Start

Quickly scaffold a new modern TypeScript or React library with Bunup in just 10 seconds.

```sh
bunx @bunup/cli create
```

See the [Scaffold with Bunup](./docs/scaffold-with-bunup.md) page for more details.

Or, initialize bunup in an existing project:

```sh
bunx @bunup/cli init
```

## Getting Started

Get started with Bunup in seconds - install, configure, and build your TypeScript projects with minimal setup.

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

That's it! This creates bundled output in the `dist` directory with ESM format (the default), plus TypeScript declaration files (`.d.ts`) since the entry point is a TypeScript file.

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
		"build": "bunup src/index.ts"
	}
}
```

Then run:

```sh
bun run build
```

## Configuration

Create a `bunup.config.ts` file for more advanced usage like including plugins, hooks, and advanced options that aren't available via CLI.

For example, you can add the [exports](/docs/plugins/exports) plugin to automatically sync your package.json exports on each build - no more manual export management!

```typescript [bunup.config.ts]
import { defineConfig } from 'bunup';
import { exports } from 'bunup/plugins';

export default defineConfig({
	entry: 'src/index.ts',
	plugins: [exports()],
});
```

You can also export an array of configurations:

```typescript [bunup.config.ts]
export default defineConfig([
	{
		name: 'node',
		entry: 'src/index.ts',
		format: 'esm',
		target: 'node',
	},
	{
		name: 'browser',
		entry: 'src/index.ts',
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
		"entry": ["src/index.ts", "src/cli.ts"],
		"target": "bun",
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
