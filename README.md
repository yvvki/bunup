![Og](https://bunup.arshadyaseen.com/og.png)

Bunup outperforms other popular bundlers by a significant margin:

| Bundler       | Format   | Build Time  | Relative Speed       |
| ------------- | -------- | ----------- | -------------------- |
| bunup         | esm, cjs | **3.65ms**  | **⚡️ 16.0x faster** |
| bunup (+ dts) | esm, cjs | **36.44ms** | **⚡️ 20.4x faster** |
| tsup          | esm, cjs | 58.36ms     | baseline             |
| tsup (+ dts)  | esm, cjs | 745.23ms    | baseline             |

_Lower build time is better. Benchmark run on the same code with identical output formats._

## Quick Start

### Installation

```bash
npm install --save-dev bunup
```

### Basic Usage

Create a simple TypeScript file:

```typescript
// src/index.ts
export function greet(name: string): string {
      return `Hello, ${name}!`;
}
```

Bundle it with bunup:

```bash
bunup src/index.ts
```

This will create a bundled output in the `dist` directory.

### Using with package.json

Add a build script to your `package.json`:

```json
{
      "name": "my-package",
      "scripts": {
            "build": "bunup src/index.ts --format esm,cjs --dts"
      }
}
```

Then run:

```bash
npm run build
```

### Configuration File

Create a `bunup.config.ts` file for more control:

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

For complete documentation, visit [the full documentation](https://bunup.arshadyaseen.com/).

For options API reference, visit [the API documentation](https://tsdocs.dev/docs/bunup/latest/interfaces/_internal_.BunupOptions.html).

## Contributing

For guidelines on contributing, please read the [contributing guide](https://github.com/arshad-yaseen/bunup/blob/main/CONTRIBUTING.md).

We welcome contributions from the community to enhance Bunup's capabilities and make it even more powerful. ❤️
