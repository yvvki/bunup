# Bunup

A extremely fast, zero-config bundler for TypeScript & JavaScript, powered by Bun.

![Demo](/demo.gif)

> Built with speed in mind, Bunup aims to provide the fastest bundling experience possible. This project is currently a work in progress and will be ready for production use soon.

## Benchmarks

Bunup outperforms other popular bundlers by a significant margin:

| Bundler       | Format   | Build Time  | Relative Speed   |
| ------------- | -------- | ----------- | ---------------- |
| bunup         | esm, cjs | **3.65ms**  | **16.0x faster** |
| bunup (+ dts) | esm, cjs | **36.44ms** | **20.4x faster** |
| tsup          | esm, cjs | 58.36ms     | baseline         |
| tsup (+ dts)  | esm, cjs | 745.23ms    | baseline         |

_Lower build time is better. Benchmark run on the same code with identical output formats._
