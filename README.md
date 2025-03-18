# Bunup

A extremely fast, zero-config bundler for TypeScript & JavaScript, powered by Bun.

> Built with speed in mind, Bunup aims to provide the fastest bundling experience possible. This project is currently a work in progress and will be ready for production use soon.

## Benchmarks

Bunup outperforms other popular bundlers by a significant margin:

| Bundler       | Format   | Build Time  | Relative Speed   |
| ------------- | -------- | ----------- | ---------------- |
| bunup         | esm, cjs | **3.65ms**  | **16.0x faster** |
| bunup (+ dts) | esm, cjs | **42.78ms** | **17.4x faster** |
| tsup          | esm, cjs | 58.36ms     | baseline         |
| tsup (+ dts)  | esm, cjs | 745.23ms    | baseline         |

_Lower build time is better. Benchmark run on the same code with identical output formats._

## Advanced Features

### Worker-based DTS Generation

For large projects, you can enable worker-based DTS generation to improve build performance:

```js
// bunup.config.js
import {defineConfig} from 'bunup';

export default defineConfig({
    // ... other options
    dts: true,
    dtsWorker: true, // Run DTS generation in a worker thread
});
```

Or via CLI:

```bash
bunup src/index.ts --dts --dts-worker
# or using the short alias
bunup src/index.ts -d -dw
```

This runs TypeScript declaration file generation in a separate worker thread, which can significantly improve build times for large projects by parallelizing the work and keeping the main thread responsive.
