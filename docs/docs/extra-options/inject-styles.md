# Inject Styles

Inject styles automatically includes your CSS styles in your JavaScript bundle, so users don't need to manually import CSS files. Instead of creating separate `.css` files, your styles become part of your JavaScript code.

## How it works

Instead of outputting CSS files in the build output, inject styles converts your CSS into JavaScript that creates `<style>` tags in the browser. When someone imports your library, the styles are automatically injected into the page.

## Before vs After

### Without inject styles

Your build creates separate files:

```plaintext {3}
dist/
├── index.js
└── index.css
```

Users must import both:

```javascript
import 'my-library/dist/index.css';
import { Button } from 'my-library';

<Button />
```

### With inject styles

Your build emits only JavaScript (CSS is inlined):

```
dist/
└── index.js
```

Users only import JavaScript, CSS is automatically included:

```javascript
import { Button } from 'my-library';

<Button />
```

## Usage

Enable inject styles in your config:

::: code-group

```sh [CLI]
bunup --css.inject
```

```ts [bunup.config.ts]
import { defineConfig } from 'bunup';

export default defineConfig({
  css: {
    inject: true,
  },
});
```

:::

That's it! Your CSS will be automatically included in your JavaScript bundle.

::: info
Injected CSS is processed for broad browser compatibility (syntax lowering, vendor prefixing, etc.), as described in the [CSS guide’s Browser Compatibility section](/docs/guide/css#browser-compatibility).
:::

## Options

### `minify`

Minifies injected CSS by default. You can disable it like this:

::: code-group

```sh [CLI]
bunup --css.inject.minify=false
```

```ts [bunup.config.ts]
import { defineConfig } from 'bunup';

export default defineConfig({
  css: {
    inject: {
      minify: false,
    },
  },
});
```

:::

## Advanced Options

### Custom Injection

By default, bunup uses its own `injectStyle` function that creates a `<style>` tag and appends it to the document head. You can provide your own injection logic using the `inject` function to customize how styles are applied to the document.

The `inject` function receives the processed CSS string (already JSON stringified) and the original file path, and should return JavaScript code that will inject the styles when executed.

```ts [bunup.config.ts]
import { defineConfig } from 'bunup';

export default defineConfig({
  css: {
    inject: {
      inject: (css, filePath) => {
        return `
          const style = document.createElement('style');
          style.setAttribute('data-source', '${filePath}');
          style.textContent = ${css};
          document.head.appendChild(style);
        `;
      }
    },
  },
});
```

:::info
The above example is basic. The default injection handles cases such as when `document` is undefined (e.g., server-side rendering) and compatibility with older browsers. Consider these when implementing custom injection logic.
:::
