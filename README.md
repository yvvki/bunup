# Bunup

A extremely fast, zero-config bundler for TypeScript & JavaScript, powered by [Bun](https://bun.sh) and [oxc](https://oxc.rs/).

<img src="https//bunup.arshadyaseen.com/demo.gif" alt="Demo" style="border-radius: 8px; border: 1px solid rgba(128, 128, 128, 0.2); box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);" />

## Benchmarks

Bunup outperforms other popular bundlers by a significant margin:

| Bundler       | Format   | Build Time  | Relative Speed   |
| ------------- | -------- | ----------- | ---------------- |
| bunup         | esm, cjs | **3.65ms**  | **16.0x faster** |
| bunup (+ dts) | esm, cjs | **36.44ms** | **20.4x faster** |
| tsup          | esm, cjs | 58.36ms     | baseline         |
| tsup (+ dts)  | esm, cjs | 745.23ms    | baseline         |

_Lower build time is better. Benchmark run on the same code with identical output formats._

## Prerequisites

Bunup requires [Bun](https://bun.sh) to be installed on your system. Bun is a fast all-in-one JavaScript runtime that powers Bunup's exceptional performance. Without Bun, Bunup cannot execute as it leverages Bun's bundling capabilities and runtime environment.

To install Bun, please visit the [official Bun installation page](https://bun.sh/docs/installation).

## Quick Start

### Installation

```bash
npm install --save-dev bunup
```

### Basic Usage

```bash
# Bundle a TypeScript file
bunup src/index.ts

# Multiple formats with TypeScript declarations
bunup src/index.ts --format esm,cjs --dts

# Watch mode
bunup src/index.ts --watch
```

### Configuration File

Create a `bunup.config.ts` file:

```typescript
import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    minify: true,
});
```

## Documentation

For complete documentation, visit [the full documentation](https://github.com/yourusername/bunup/docs).

## Contributing

For guidelines on contributing, please read the [contributing guide](https://github.com/arshad-yaseen/bunup/blob/main/CONTRIBUTING.md).

We welcome contributions from the community to enhance Bunup's capabilities and make it even more powerful. ❤️
