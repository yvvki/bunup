# React Component Library

Build a production-ready React component library with Bunup in minutes. Zero config. Just works.

## Setup

Install dependencies:

```bash
bun add --dev bunup typescript react react-dom @types/react @types/react-dom
```

Configure your project:

::: code-group

```json [package.json]
{
  // ... rest of your package.json
  "type": "module",
  "scripts": {
    "build": "bunup",
    "dev": "bunup --watch"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

```json [tsconfig.json]
{
  "compilerOptions": {
    // ... rest of your compilerOptions
    "jsx": "react-jsx",
    "declaration": true,
    "isolatedDeclarations": true
  }
}
```

:::

That's it! You're ready to build components.

## Creating Components

Create your first component:

```tsx [src/components/button.tsx]
'use client'

export function Button(props: React.ComponentProps<'button'>): React.ReactNode {
  return <button type="button" {...props} />
}
```

Export it from your entry point:

```tsx [src/index.tsx]
export { Button } from './components/button'
```

Build and watch:

```bash
bun run dev
```

Your component is now compiled in `dist/index.js` with TypeScript declarations in `dist/index.d.ts`.

## Styling Options

Bunup supports multiple styling approaches out of the box. Choose what works best for your library.

### Pure CSS

Import CSS directly in your components. Bunup bundles everything automatically.

```css [src/styles.css]
:root {
  --button-bg: hsl(211, 100%, 50%);
  --button-bg-hover: hsl(211, 100%, 45%);
  --button-text: hsl(0, 0%, 100%);
}

@media (prefers-color-scheme: dark) {
  :root {
    --button-bg: hsl(211, 80%, 55%);
    --button-bg-hover: hsl(211, 80%, 60%);
  }
}

[data-slot="button"] {
  background: var(--button-bg);
  color: var(--button-text);
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

[data-slot="button"]:hover {
  background: var(--button-bg-hover);
}
```

```tsx [src/components/button.tsx]
'use client'

export function Button(props: React.ComponentProps<'button'>): React.ReactNode {
  return <button type="button" data-slot="button" {...props} />
}
```

```tsx [src/index.tsx]
import './styles.css'

export { Button } from './components/button'
```

Your CSS is automatically bundled into `dist/index.css` with cross-browser compatibility. Learn more about [CSS support](/docs/guide/css).

### CSS Modules

Get automatic class name scoping with CSS modules. Just use `.module.css`:

```css [src/components/button.module.css]
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  color: white;
}

.primary {
  background-color: #007bff;
}

.primary:hover {
  background-color: #0056b3;
}

.secondary {
  background-color: #6c757d;
}

.secondary:hover {
  background-color: #565e64;
}

.danger {
  background-color: #dc3545;
}

.danger:hover {
  background-color: #a71d2a;
}
```

```tsx [src/components/button.tsx]
'use client'

import styles from './button.module.css'

type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({
  variant = 'primary',
  ...props
}: ButtonProps): React.ReactNode {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]}`}
      {...props}
    />
  )
}
```

TypeScript definitions are generated automatically - you get full autocomplete and type safety. Learn more about [CSS modules](/docs/guide/css#css-modules).

### Tailwind CSS

Use Tailwind CSS v4 with zero PostCSS configuration. Your components work everywhere - consumers don't need Tailwind installed.

Install the Tailwind CSS plugin:

```bash
bun add --dev @bunup/plugin-tailwindcss
```

Add it to your config:

```ts [bunup.config.ts]
import { defineConfig } from 'bunup'
import { tailwindcss } from '@bunup/plugin-tailwindcss'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

Create your styles with a scoped prefix to prevent conflicts:

```css [src/styles.css]
@import "tailwindcss" prefix(mylib);
```

Use prefixed classes in your components:

```tsx [src/components/button.tsx]
'use client'

export function Button(props: React.ComponentProps<'button'>): React.ReactNode {
  return (
    <button
      type="button"
      className="mylib:bg-blue-500 mylib:hover:bg-blue-600 mylib:text-white mylib:px-4 mylib:py-2 mylib:rounded-md"
      {...props}
    />
  )
}
```

```tsx [src/index.tsx]
import './styles.css'

export { Button } from './components/button'
```

The plugin outputs scoped, tree-shaken CSS. Only the classes you use are included, and the prefix prevents conflicts with consumer applications. Learn more about the [Tailwind CSS plugin](/docs/builtin-plugins/tailwindcss).

## Distribution

Configure your `package.json` for npm publishing:

```json [package.json]
{
  "name": "my-component-library",
  "version": "1.0.0",
  "type": "module",
  "files": [
    "dist"
  ],
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
    "./styles.css": "./dist/index.css",
    "./package.json": "./package.json"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

Consumers import your library like this:

```tsx
import 'my-component-library/styles.css'
import { Button } from 'my-component-library'

function App() {
  return <Button>Click me</Button>
}
```

### Inject Styles (Optional)

Want to skip the separate CSS import? Use the [inject styles](/docs/extra-options/inject-styles) option to bundle CSS directly into JavaScript:

::: code-group

```sh [CLI]
bunup --css.inject
```

```ts [bunup.config.ts]
import { defineConfig } from 'bunup'

export default defineConfig({
  css: {
    inject: true,
  },
})
```

:::

Or with the Tailwind CSS plugin:

```ts [bunup.config.ts]
import { defineConfig } from 'bunup'
import { tailwindcss } from '@bunup/plugin-tailwindcss'

export default defineConfig({
  plugins: [
    tailwindcss({
      inject: true,
    })
  ],
})
```

Now consumers only need to import your components:

```tsx
import { Button } from 'my-component-library'

function App() {
  return <Button>Click me</Button>
}
```

Styles are automatically injected at runtime.

### Auto-generate Exports

Let Bunup automatically manage your `exports` field with the [exports](/docs/extra-options/exports) option:

::: code-group

```sh [CLI]
bunup --exports
```

```ts [bunup.config.ts]
import { defineConfig } from 'bunup'

export default defineConfig({
  exports: true,
})
```

:::

Your `package.json` exports are updated automatically on every build - no manual sync needed.

## Examples

Check out complete examples in the [examples directory](https://github.com/bunup/bunup/tree/main/examples):

- [react-with-pure-css](https://github.com/bunup/bunup/tree/main/examples/react-with-pure-css) - React with pure CSS
- [react-with-css-modules](https://github.com/bunup/bunup/tree/main/examples/react-with-css-modules) - React with CSS modules and type generation
- [react-with-tailwindcss](https://github.com/bunup/bunup/tree/main/examples/react-with-tailwindcss) - React with Tailwind CSS and scoping

## That's It

You just built a production-ready React component library with:

- TypeScript declarations
- Multiple styling options (pure CSS, CSS modules, Tailwind)
- Automatic CSS bundling and optimization
- Cross-browser compatibility
- Optional style injection
- Clean package exports

All with minimal configuration. Build what matters.
