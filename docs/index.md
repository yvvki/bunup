# Introduction

Bunup is the **blazing-fast build tool** for TypeScript libraries, designed for flawless developer experience and speed, **powered by Bun**.

## Performance

**Bunup** delivers instant builds by design. With Bun's native speed, builds and rebuilds are extremely quick, even in monorepos, making you feel more productive and providing a more enjoyable development experience. See [benchmarks](https://gugustinette.github.io/bundler-benchmark/).

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
bunx @bunup/cli@latest create
```

See the [Scaffold with Bunup](./docs/scaffold-with-bunup.md) page for more details.

Or, initialize bunup in an existing project:

```sh
bunx @bunup/cli@latest init
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
bunx bunup
```

That's it! This creates bundled output in the `dist` directory in ESM format (the default), plus TypeScript declaration files (`.d.ts`), since the entry point is a TypeScript file and has exports.

Or if you want to build for multiple formats like ESM and CJS, use the `--format` option:

```sh
bunx bunup --format esm,cjs
```

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
		"build": "bunup"
	}
}
```

Then run:

```sh
bun run build
```

## Default Entry Points

If your entry point is one of these common paths, you don't need to specify it explicitly. Just run `bunx bunup` or omit the `entry` field from your config file.

- `index.ts`
- `index.tsx`
- `src/index.ts`
- `src/index.tsx`
- `cli.ts`
- `src/cli.ts`
- `src/cli/index.ts`

For example, if you have `src/index.ts` and `src/cli.ts`, Bunup will build both automatically. If you don't need to bundle the CLI or have different entry points, you can explicitly specify them to override the defaults. Refer to the [Entry Points](/docs/guide/options#entry-points) section for more details.

For example:

```sh
bunx bunup src/index.ts src/plugins.ts
```

## Watch Mode

Bunup can watch your files for changes and rebuild automatically:

```sh
bunx bunup --watch
```

Or in package.json:

```json [package.json] 5
{
	"name": "my-package",
	"scripts": {
		"build": "bunup",
		"dev": "bunup --watch"
	}
}
```

Then run:

```sh
bun run dev
```

## Next Steps

This introduction covers the basic usage of Bunup. For additional functionality, explore:

- **[Options](/docs/guide/options)** - Configuration options and CLI flags
- **[Workspaces](/docs/guide/workspaces)** - Monorepo support with single-command builds
- **[Extra Options](/docs/extra-options/exports)** - Quality-of-life improvements

Basically, you only need this to start and publish a fully-ready package:

```sh
bunup --exports --unused
```

This command builds your entry files (like `src/index.ts`) to ESM format, generates TypeScript declarations, syncs your `package.json` exports, and reports unused dependencies, making your package publish-ready.

Bunup also includes built-in plugins for copying files, Tailwind CSS, and more. 

Check the documentation for additional features like CSS processing.
