# Bunup

> A extremely fast, zero-config bundler for TypeScript & JavaScript, powered by Bun.

Built with speed in mind, Bunup aims to provide the fastest bundling experience possible. This project is currently a work in progress and will be ready for production use soon.

## Benchmarks

Bunup outperforms other popular bundlers by a significant margin:

| Bundler        | Format   | Build Time   | Relative Speed   |
| -------------- | -------- | ------------ | ---------------- |
| bunup          | esm, cjs | **3.65ms**   | **10.8x faster** |
| bunup (+ dts)  | esm, cjs | **149.51ms** | **4.5x faster**  |
| tsdown         | esm, cjs | 20.42ms      | 1.9x faster      |
| tsdown (+ dts) | esm, cjs | 689.33ms     | 0.98x slower     |
| tsup           | esm, cjs | 39.30ms      | baseline         |
| tsup (+ dts)   | esm, cjs | 672.67ms     | baseline         |

_Lower build time is better. Benchmark run on the same code with identical output formats._
