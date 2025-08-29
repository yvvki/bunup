# typeroll

A blazing-fast `.d.ts` bundler written in Bun, designed to generate and merge TypeScript declarations from an entry point into a single `index.d.ts`, with advanced features like splitting and minification.

Typeroll powers [Bunup's TypeScript declarations feature](https://bunup.dev/docs/guide/typescript-declarations). Learn more at [bunup.dev](https://bunup.dev/).

## How It Works

Typeroll leverages **Bun's native bundler** under the hood to achieve blazing-fast TypeScript declaration bundling. Since Bun's bundler is designed for JavaScript and outputs JavaScript (not built for types or `.d.ts` files), we employ some clever tricks to make Bun bundle TypeScript declarations while supporting advanced features like code splitting and minification.

### The Process

**1. Declaration Generation**

First, `typeroll` generates `.d.ts` files from TypeScript sources using **isolated declarations** via `oxc-transform`.

**2. FakeJS Transformation**

Here's where the magic happens: we convert `.d.ts` files into synthetic JavaScript modules ("FakeJS"). Each type declaration becomes a **token array** where:
- Type content is broken down into individual tokens
- **Identifiers are preserved as live JavaScript variables** (not strings)
- The array variable name matches the original type name

```javascript
// Original TypeScript declaration:
export interface UserProfile extends BaseUser {
  name: string;
  age: number;
}

// Transformed to FakeJS:
export var UserProfile = [
  "interface", UserProfile, "extends", BaseUser, "{",
  "name", ":", "string", ";",
  "age", ":", "number", ";",
  "}"
];
```

**3. Bundling with Bun**

Bun treats these FakeJS modules as regular JavaScript, enabling it to:
- **Track usage** of types through variable references
- Apply **tree-shaking** to remove unused types
- Perform **code splitting** when shared types are detected
- Apply **name mangling** during minification

The key insight: since identifiers are live variables, when Bun renames a variable during minification, it automatically updates **all references** throughout the bundle.

**4. Rehydration**

After bundling, we convert the Bun-bundled FakeJS back to clean `.d.ts` declarations. The beauty is that any name mangling applied by Bun is perfectly preserved—if Bun renamed `UserInterface` to `a`, all references are consistently updated.

### The Result

This round-trip transformation gives us the best of both worlds: the performance and advanced features of Bun's JavaScript bundler applied to TypeScript declarations, resulting in optimized, tree-shaken, and properly split `.d.ts` files without relying on TypeScript's own emit pipeline.
