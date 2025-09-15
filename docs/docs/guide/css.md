# CSS

Bunup supports CSS out of the box.

## Usage

You can provide standalone CSS files as entry points or import CSS files in your source files. 

All CSS files encountered during the build process are bundled into cross-browser compatible CSS files in the build output with vendor prefixing and syntax lowering.

### CSS Entry Points

You can specify CSS files as entry points in your configuration:

```typescript [bunup.config.ts]
import { defineConfig } from 'bunup';

export default defineConfig({
  entry: [
    'src/index.ts', 
    'src/components/button.css', 
    'src/components/card.css'
  ],
});
```

Specifying CSS files as entry points will create separate CSS files in the build output for each entry point. 

In this example:

```plaintext
dist/
├── index.js
├── components/
│   ├── button.css
│   └── card.css
```

### Importing CSS in Source Files

The most common approach is importing CSS files in your main entry point, especially when building component libraries:

::: code-group

```typescript [src/index.ts]
import './styles.css';
import { Button } from './components/button';

export { Button };
```

```css [src/styles.css]
.button {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
}

.button:hover {
  background-color: #0056b3;
}
```

:::

Unlike specifying CSS files as entry points, if you import CSS files in your source files, Bunup will bundle them together into a single CSS file named `index.css` in the build output:

```plaintext
dist/
├── index.js
└── index.css
```

## CSS Modules

Bunup supports CSS modules out of the box with zero configuration. CSS modules automatically scope class names to prevent collisions.

### Getting Started

Create a CSS file with the `.module.css` extension:

::: code-group

```css [src/components/button.module.css]
.primary {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
}

.secondary {
  background-color: transparent;
  color: #007bff;
  padding: 8px 16px;
  border: 1px solid #007bff;
  border-radius: 4px;
}
```

```tsx [src/components/button.tsx]
import styles from "./button.module.css";

export function Button({ variant = "primary", children }) {
  return (
    <button className={styles[variant]}>
      {children}
    </button>
  );
}
```

:::

### Composition

CSS modules support the `composes` property to reuse style rules across multiple classes:

```css [src/components/button.module.css]
.base {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary {
  composes: base;
  background-color: #007bff;
  color: white;
}

.secondary {
  composes: base;
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}
```

#### Composition Rules

- The `composes` property must come before any regular CSS properties
- You can only use `composes` on simple selectors with a single class name

```css
/* Invalid - not a class selector */
#button {
  composes: background;
}

/* Invalid - not a simple selector */
.button,
.button-secondary {
  composes: background;
}

/* Valid */
.button {
  composes: background;
}
```

#### Composing from Separate Files

You can compose classes from separate CSS module files:

::: code-group

```css [src/shared.module.css]
.base {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
```

```css [src/components/button.module.css]
.primary {
  composes: base from "../shared.module.css";
  background-color: #007bff;
  color: white;
  border: none;
}
```

:::

::: warning
When composing classes from separate files, ensure they don't contain conflicting properties, as this can lead to undefined behavior.
:::

## CSS Exports

When you include CSS files as entry points, they are bundled and available for consumers to import. You can export CSS files in your package's exports field:

```json [package.json]
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/index.css" // [!code ++]
  }
}
```

Consumers can then import your CSS in their applications:

```javascript
import 'your-package/styles.css';
```

Alternatively, you can use the [inject styles plugin](/docs/plugins/inject-styles) to automatically include CSS in your JavaScript bundle, eliminating the need for consumers to manually import CSS files.

::: tip
When using the [exports plugin](/docs/plugins/exports), CSS or style exports are automatically added to your package's exports field.
:::

## Browser Compatibility

Bunup automatically handles browser compatibility by:

- **Syntax Lowering**: Converts modern CSS syntax into backwards-compatible equivalents
- **Vendor Prefixing**: Automatically adds vendor prefixes where needed
- **Target Browsers**: By default, targets the following browsers:
  - Edge 88+
  - Firefox 78+
  - Chrome 87+
  - Safari 14+

## CSS Modules and TypeScript

Bunup automatically generates TypeScript definitions for CSS modules, providing type safety and autocomplete.

### Automatic Type Generation

Bunup generates `.d.ts` files for each `.module.css` file:

::: code-group

```css [src/components/button.module.css]
.primary {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
}

.secondary {
  background-color: transparent;
  color: #007bff;
  padding: 8px 16px;
  border: 1px solid #007bff;
  border-radius: 4px;
}
```

```ts [src/components/button.module.css.d.ts]
declare const classes: {
  readonly primary: string;
  readonly secondary: string;
};

export default classes;
```

:::

### Benefits

- **Autocomplete**: TypeScript suggests available class names when typing `styles.`
- **Compile-time Error Checking**: Accessing non-existent classes shows TypeScript errors
- **Refactoring Safety**: Renaming classes in CSS immediately highlights usage errors

### Development Workflow

#### Watch Mode <Badge type="info" text="Recommended" />

Use watch mode for instant type updates:

```sh
bunup --watch
```

Type definitions regenerate immediately when you save CSS module changes. Renaming `.primary` to `.primary-button` will instantly show TypeScript errors wherever `styles.primary` is used.

#### Build Mode

Run the build command to regenerate types after CSS module changes:

```sh
bunup
```

### Git Configuration

Exclude generated type definition files from version control:

```plaintext [.gitignore]
# Generated CSS module type definitions
**/*.module.*.d.ts
```

### Disabling Type Generation

Disable automatic type generation if you prefer manual handling:

```ts [bunup.config.ts]
import { defineConfig } from 'bunup';

export default defineConfig({
  entry: ['src/index.tsx'],
  css: {
    typedModules: false
  }
});
```
