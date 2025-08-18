# Inject Styles

The `injectStyles` plugin transforms CSS imports (like `import "./styles.css"`) into JavaScript code that automatically injects styles into the document head at runtime. This is particularly useful for component libraries where styles should be automatically applied without requiring users to manually include CSS files.

## Installation

The plugin uses LightningCSS under the hood. Install it as a dev dependency:

```bash
bun add --dev lightningcss
```

## Usage

```ts [bunup.config.ts]
import { defineConfig } from 'bunup';
import { injectStyles } from 'bunup/plugins';

export default defineConfig({
  entry: ['src/index.ts'],
  plugins: [injectStyles()],
});
```

CSS imports in your code will be automatically processed:

```ts [src/index.ts]
// These CSS imports will be transformed into JavaScript code
// that injects the styles into <head> at runtime
import "./styles.css";
import "./components/button.css";

export { Button } from "./components/Button";
```

Instead of bundling separate CSS files, the styles will be embedded as JavaScript code that creates `<style>` tags in the document head.

## Options

The plugin passes options directly to LightningCSS. Available options include:

- `minify`: Controls whether the CSS should be minified (enabled by default if minify option is enabled in build config)
- `targets`: Specifies browser targets for CSS feature compatibility

For a complete list of options, refer to the [Lightning CSS documentation](https://lightningcss.dev/docs.html).
