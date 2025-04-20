# Workspaces

Bunup provides robust support for monorepo workspaces, allowing you to define build configurations for multiple packages in a single configuration file.

## Basic Workspace Configuration

To define a workspace configuration, use the `defineWorkspace` function:

```typescript [bunup.config.ts]
import { defineWorkspace } from "bunup";

export default defineWorkspace([
  {
    name: "core-package",
    root: "packages/core",
    config: {
      entry: ["src/index.ts"],
      format: ["esm", "cjs"],
      dts: true,
    },
  },
  {
    name: "utils-package",
    root: "packages/utils",
    config: {
      entry: ["src/index.ts"],
      format: ["esm"],
      dts: true,
    },
  },
]);
```

## Workspace Structure

Each workspace entry requires three properties:

- **name**: A unique identifier for the workspace (used in logs)
- **root**: The relative path to the workspace root directory
- **config**: The build configuration for the workspace (same options as `defineConfig`)

## Multiple Configurations per Workspace

You can define multiple build configurations for a single workspace by using an array for the `config` property:

```typescript [bunup.config.ts]
export default defineWorkspace([
  {
    name: "web-package",
    root: "packages/web",
    config: [
      {
        name: "esm-build",
        entry: ["src/index.ts"],
        format: ["esm"],
        target: "browser",
      },
      {
        name: "cjs-build",
        entry: ["src/index.ts"],
        format: ["cjs"],
        target: "node",
      },
    ],
  },
]);
```

## Working with Workspace Paths

All paths in workspace configurations are resolved relative to each workspace's root directory. This means:

- Entry points are resolved from the workspace root
- Output is generated relative to the workspace root
- TypeScript configurations are loaded from the workspace root

For example, with the following configuration:

```typescript
{
      name: 'my-package',
      root: 'packages/my-package',
      config: {
            entry: ['src/index.ts'],
            outDir: 'dist',
      },
}
```

The entry point will be resolved as `packages/my-package/src/index.ts` and the output will be written to `packages/my-package/dist/`.

## Running Workspace Builds

To build all workspaces, simply run the `bunup` command with no additional arguments:

```sh
bunup
```

Bunup will automatically detect and build all workspaces defined in your configuration file.

To watch the packages in workspaces and automatically rebuild on file changes, run:

```sh
bunup --watch
```

This single command enables continuous monitoring and rebuilding of all packages in your workspaces. 
