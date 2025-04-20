# bunup

[![npm version](https://img.shields.io/npm/v/bunup.svg?style=flat-square)](https://www.npmjs.com/package/bunup)
[![npm downloads](https://img.shields.io/npm/dm/bunup.svg?style=flat-square)](https://www.npmjs.com/package/bunup)

Bunup is the **high-performance build tool** for TypeScript and JavaScript libraries, with **first-class support** for libraries built with [Bun](https://bun.sh/). It delivers **lightning-fast builds** — up to **~50× faster than Tsup**.

| Bundler | Format   | Build Time     | Build Time (with dts) |
| ------- | -------- | -------------- | --------------------- |
| bunup   | esm, cjs | **3.52ms ⚡️** | **20.84ms ⚡️**       |
| tsdown  | esm, cjs | 5.81ms         | 35.84ms               |
| unbuild | esm, cjs | 42.47ms        | 314.54ms              |
| tsup    | esm, cjs | 63.59ms        | 943.61ms              |

_Lower is better. Benchmarks run on identical code and output formats._

Want proof? Clone the repo, run `pnpm benchmark`, and check `benchmarks/results.md` for yourself!

## Key Features

- ⚡️ **Ultra Fast Builds**: Lightning-fast performance powered by [Bun](https://bun.sh/)'s native bundler and [Oxc](https://oxc.rs).

- 🔥 **Bytecode Generation**: Faster startups by compiling to Bun bytecode—perfect for CLIs.

- 📦 **Workspace Support**: Build multiple packages with [defineWorkspace()](https://bunup.arshadyaseen.com/documentation/#workspaces) in one config file and command.

- 🔄 **Tsup Familiarity**: Familiar tsup-like CLI and config.

- 🎯 **Bun Targeting**: Optimize for Bun runtime with `--target bun` for native features.

## 📚 Documentation

For complete documentation, visit [bunup.arshadyaseen.com](https://bunup.arshadyaseen.com/).

## ⚡️ Create TypeScript Libraries Faster

Quickly scaffold modern TypeScript library in 10 seconds. Powered by bunup.

```bash
# Using bun
bunx create-bunup@latest

# Using npm
npx create-bunup@latest

# Using pnpm
pnpx create-bunup@latest
```

Check out our [TypeScript Library Starter documentation](https://bunup.arshadyaseen.com/typescript-library-starter.html) for more details.

## ❤️ Contributing

For guidelines on contributing, please read the [contributing guide](https://github.com/arshad-yaseen/bunup/blob/main/CONTRIBUTING.md).

We welcome contributions from the community to enhance Bunup's capabilities and make it even more powerful.
