# Plugins

Bunup's plugin system allows you to extend and customize the build process to meet your specific needs. 

## Plugin System

Bunup supports a flexible plugin system that allows for various types of plugins:

- **Bun plugins**: Native `Bun.build` plugins
- **Bunup plugins**: Custom plugins specifically designed for Bunup's additional features (coming soon)

Since Bun's bundler is responsible for the core bundling process (except for TypeScript declaration files), you can achieve most customizations by using Bun plugins, which are passed directly to the underlying `Bun.build` configuration.

## Using Plugins

To use plugins in your Bunup configuration, add them to the `plugins` array in your `bunup.config.ts` file:

```typescript
import { defineConfig } from "bunup";
import myBunPlugin from "bun-plugin-example";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  plugins: [
    {
      type: "bun",
      plugin: myBunPlugin()
    }
  ]
});
```

Each plugin entry requires:

- `type`: The plugin system type (currently only "bun" is supported)
- `plugin`: The actual plugin instance

## Available Plugins

Check out our [Built-in Plugins](/plugins/built-in) for a list of plugins that come packaged with Bunup. 
