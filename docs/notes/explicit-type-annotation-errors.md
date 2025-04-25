# Explicit Type Annotation Errors

### What's Happening

Bunup utilizes TypeScript's `isolatedDeclarations` feature to generate type declarations. This is a specialized feature introduced by TypeScript to create declaration files more safely, quickly, and accurately than traditional methods.

### Why It Matters

Traditional type declaration generation requires the TypeScript compiler to analyze your entire codebase to infer return types and other type information, which is computationally expensive and slow. The `isolatedDeclarations` approach eliminates this overhead by requiring explicit type annotations on exported items.

### What You Need to Do

You must add explicit type annotations to any values exported from your library. This allows to generate accurate and more predictable type declarations without analyzing implementation details.

For example, change this:

```js [index.ts]
export const variable = someFuncThatReturnsNumber()
```

To this:

```js [index.ts]
export const variable: number = someFuncThatReturnsNumber()
```

::: info
You only need explicit annotations for items exported from your library. Internal code doesn't require this treatment, and **Bunup will only prompt you when annotations are missing from exports**.
:::

### Watch Mode vs. Build Mode

- **Watch mode (development)**: Bunup shows warnings about missing type annotations but continues generating declarations (with `unknown` types where annotations are missing). Since this is development mode, you can fix these issues on the go when you see the warnings.
- **Build mode (production)**: Bunup fails the build to ensure your library has proper type definitions

### How to Fix

Simply add the missing type annotations indicated in the error messages. You can navigate directly to each issue by clicking the file paths in the error messages. This typically takes only a few moments to resolve.

### Recommended Configuration

While optional, it's recommended to add this to your `tsconfig.json`:

```json [tsconfig.json]
{
  "compilerOptions": {
    "declaration": true,
    "isolatedDeclarations": true
  }
}
```

By adding this configuration to your project, you'll catch type annotation issues during development rather than at build time, making your workflow more efficient. Once you've properly annotated all exported types, you won't encounter these errors during builds, resulting in a more robust and library-ready codebase.

For more details, see the [TypeScript's Explanation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations).

