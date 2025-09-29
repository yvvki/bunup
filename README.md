<!-- markdownlint-disable first-line-h1 -->
<!-- markdownlint-disable-file no-inline-html -->

<div align="center">

  <!-- Logo -->
  <img src="docs/public/logo.svg" height="120" alt="Bunup logo" />

  <!-- Title -->
  <img src="assets/bunup-title.svg" height="60" alt="Bunup" />

  <br />

  [![NPM Version](https://img.shields.io/npm/v/bunup?logo=npm&logoColor=212121&label=version&labelColor=ffc44e&color=212121)](https://npmjs.com/package/bunup)
  [![Built with Bun](https://img.shields.io/badge/Built_with-Bun-fbf0df?logo=bun&labelColor=212121)](https://bun.sh)
  [![Sponsor](https://img.shields.io/badge/sponsor-EA4AAA?logo=githubsponsors&labelColor=FAFAFA)](https://github.com/sponsors/arshad-yaseen)

  <p><b>Bunup helps you ship TypeScript/React libraries faster with zero-config builds, great DX, and Bun’s native speed.</b></p>

</div>

- ⚡ **Instant Builds** — Lightning-fast builds & rebuilds by default  
- 🎨 **CSS & Tailwind CSS Support** — Import CSS files directly, with built-in support for CSS Modules and Tailwind CSS for React component libraries
- 📝 **TypeScript Declarations** — Clean, accurate `.d.ts` files generated automatically  
- 🪓 **[Declaration Splitting](https://bunup.dev/docs/guide/typescript-declarations#declaration-splitting)** — Smaller, cleaner `.d.ts` bundles  
- 🔋 **Batteries Included** — Auto-exports, unused dependency detection, and more  
- 🏗️ **[Workspace Ready](https://bunup.dev/docs/guide/workspaces)** — Build multiple packages from one config and one command

## 🚀 Quick Start

Create a TypeScript file:

```ts [src/index.ts]
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

Build it instantly:

```sh
bunx bunup
```

✅ Outputs to `dist/` with ESM + `.d.ts` files.

Want CommonJS too?

```sh
bunx bunup --format esm,cjs
```

That’s it. You’re done.

For more, see the full [documentation →](https://bunup.dev)

## ❤️ Contributing

We welcome contributions from the community! Please read the [contributing guide](CONTRIBUTING.md).

<div align="center">

  <img src="https://cdn.jsdelivr.net/gh/arshad-yaseen/static/sponsors.svg" alt="Sponsors" />

<br /><br />

  <img src="assets/cat-footer.svg" alt="______ 🐈‍⬛ _____________" />

</div>
