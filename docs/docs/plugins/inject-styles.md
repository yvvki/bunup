# Inject Styles

The `injectStyles` plugin transforms CSS files and automatically injects them into the document head at runtime. This is particularly useful when building component libraries where you want styles to be automatically applied when components are used.

## Installation

The `injectStyles` plugin uses LightningCSS under the hood. You'll need to install it as a dev dependency:

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

With this configuration, any imported CSS files will be transformed and injected into the document head when your JavaScript code runs.

## Options

The plugin leverages Lightning CSS for transformations and passes the options directly to LightningCSS. Available options include:

- `minify`: Controls whether the CSS should be minified (enabled by default if minify option is enabled in build config)
- `targets`: Specifies browser targets for CSS feature compatibility

For a complete list of transformation options, refer to the [Lightning CSS documentation](https://lightningcss.dev/docs.html).
