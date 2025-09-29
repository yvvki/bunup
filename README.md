<!-- markdownlint-disable first-line-h1 -->

<!-- markdownlint-start-capture -->
<!-- markdownlint-disable-file no-inline-html -->
<div align="center">

  <!-- markdownlint-disable-next-line no-alt-text -->


![Logo](docs/public/logo.svg)

![Bunup](assets/bunup-title.svg)

[![NPM Version](https://img.shields.io/npm/v/bunup?logo=npm&logoColor=212121&label=version&labelColor=ffc44e&color=212121)](https://npmjs.com/package/bunup) [![Built with Bun](https://img.shields.io/badge/Built_with-Bun-fbf0df?logo=bun&labelColor=212121)](https://bun.sh) [![sponsor](https://img.shields.io/badge/sponsor-EA4AAA?logo=githubsponsors&labelColor=FAFAFA)](https://github.com/sponsors/arshad-yaseen)

Bunup helps you ship TypeScript/React libraries faster with great DX — built on Bun.

</div>
<!-- markdownlint-restore -->

## Performance

Bunup delivers instant builds by design. With Bun's native speed, builds and rebuilds are extremely quick, even in monorepos. You get faster feedback loops, higher productivity, and a more enjoyable development experience.

## Features

- ⚡ **Instant Builds** — Lightning-fast builds & rebuilds by default  
- 🎨 **CSS Support Out of the Box**: Import CSS files directly, with built-in support for CSS Modules.
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

That's it. You're done.

For publish-ready packages, `bunup --exports --unused` builds, generates types, syncs exports, and reports unused deps in one step.

For more, see the full [documentation →](https://bunup.dev)

## ❤️ Contributing

We welcome contributions from the community! Please read the [contributing guide](CONTRIBUTING.md).

<div align="center">

  <img src="https://cdn.jsdelivr.net/gh/arshad-yaseen/static/sponsors.svg" alt="Sponsors" />

<br /><br />

  <img src="assets/cat-footer.svg" alt="______ 🐈‍⬛ _____________" />

</div>
