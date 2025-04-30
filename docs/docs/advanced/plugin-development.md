# Plugin Development Guide

Bunup provides a flexible plugin system that allows you to extend its functionality to meet your specific needs. This guide will walk you through the process of creating your own plugins for Bunup.

## Plugin Types

Bunup supports two types of plugins:

1. **Bun Plugins** - Native Bun plugins that are passed directly to the underlying `Bun.build` configuration
2. **Bunup Plugins** - Custom plugins specifically designed for Bunup with lifecycle hooks

## Creating a Bun Plugin

Bun plugins work with Bun's native bundler and are passed directly to the `Bun.build` configuration. These plugins can be used to modify how modules are resolved, transformed, and loaded.

```ts
import type { BunPlugin } from "bun";

// Create a simple Bun plugin
const myBunPlugin = (): BunPlugin => {
  return {
    name: "my-bun-plugin",
    setup(build) {
      // Plugin implementation
      build.onLoad({ filter: /\.txt$/ }, async (args) => {
        const text = await Bun.file(args.path).text();
        return {
          contents: `export default ${JSON.stringify(text)}`,
          loader: "js",
        };
      });
    },
  };
};

export default myBunPlugin;
```

To use this plugin in Bunup:

```ts
import { defineConfig } from "bunup";
import myBunPlugin from "./my-bun-plugin";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  plugins: [
    {
      type: "bun",
      name: "my-bun-plugin", // Optional
      plugin: myBunPlugin()
    }
  ]
});
```

For more information about creating Bun plugins, see the [Bun plugin documentation](https://bun.sh/docs/bundler/plugins).

## Creating a Bunup Plugin

Bunup plugins provide additional hooks into the build process beyond what Bun's native plugin system offers. These plugins can be used to extend Bunup's functionality with custom build steps, reporting, and more.

```ts
import type { Plugin } from "bunup";

// Create a simple Bunup plugin
export function myBunupPlugin(): Plugin {
  return {
    type: "bunup",
    name: "my-bunup-plugin",
    hooks: {
      // Run before the build starts
      onBuildStart: async (options) => {
        console.log("Starting build with options:", options);
      },
      
      // Run after the build is completed
      onBuildDone: async ({ options, output }) => {
        console.log("Build completed with files:", output.files.length);
        // Do something with the build output
      }
    }
  };
}
```

To use this plugin in Bunup:

```ts
import { defineConfig } from "bunup";
import { myBunupPlugin } from "./my-bunup-plugin";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  plugins: [
    myBunupPlugin()
  ]
});
```

## Available Hooks

Bunup plugins support the following hooks:

### `onBuildStart`

Called before a build starts, allowing you to perform setup or preprocessing tasks.

```ts
onBuildStart: (options: BuildOptions) => Promise<void> | void
```

- `options`: The build options configured for this build

### `onBuildDone`

Called after a build is successfully completed, providing access to the build output.

```ts
onBuildDone: (ctx: BuildContext) => Promise<void> | void
```

Where `BuildContext` contains:
- `options`: The build options used
- `output`: Information about the generated files

## Publishing Plugins

If you've created a useful plugin for Bunup, consider publishing it as an npm package for others to use. Use a naming convention like `bunup-plugin-*` to make it easily discoverable.
