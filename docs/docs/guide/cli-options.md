# CLI Options

Bunup supports various command-line options:

```sh
bunup [...entries] [options]
```

| Option                             | Alias       | Description                                                                                        | Default          |
| ---------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- | ---------------- |
| `--entry <path>`                   |             | Entry file path or glob pattern (use '!' prefix to exclude files)                                   | `[]`             |
| `--out-dir <dir>`                  | `-o`        | Output directory                                                                                   | `dist`           |
| `--format <formats>`               | `-f`        | Output formats (comma-separated: esm,cjs,iife)                                                     | `cjs`            |
| `--minify`                         | `-m`        | Enable all minification options                                                                    | `false`          |
| `--minify-whitespace`              | `-mw`       | Minify whitespace                                                                                  | `false`          |
| `--minify-identifiers`             | `-mi`       | Minify identifiers                                                                                 | `false`          |
| `--minify-syntax`                  | `-ms`       | Minify syntax                                                                                      | `false`          |
| `--watch`                          | `-w`        | Watch mode                                                                                         | `false`          |
| `--dts`                            | `-d`        | Generate TypeScript declarations                                                                   | `false`          |
| `--external <deps>`                | `-e`        | External dependencies (comma-separated)                                                            | `[]`             |
| `--no-external <deps>`             | `-ne`       | Force include dependencies (comma-separated)                                                       | -                |
| `--target <target>`                | `-t`        | Target environment (node, browser, bun)                                                            | `node`           |
| `--clean`                          | `-c`        | Clean output directory before build                                                                | `true`           |
| `--splitting`                      | `-s`        | Enable code splitting                                                                              | Format dependent |
| `--sourcemap <type>`               | `-sm`       | Sourcemap generation (none,linked,external,inline)                                                 | `none`           |
| `--banner <text>`                  | `-bn`       | Text to add at the beginning of output files                                                       | -                |
| `--footer <text>`                  | `-ft`       | Text to add at the end of output files                                                             | -                |
| `--public-path <url>`              | `-pp`       | Prefix to be appended to import paths in bundled code                                              | -                |
| `--name <name>`                    | `-n`        | Name for this build configuration                                                                  | -                |
| `--resolve-dts <value>`            | `-rd`       | Resolve external types for declaration files (can be boolean flag or comma-separated package list) | `false`          |
| `--preferred-tsconfig-path <path>` | `-tsconfig` | Path to preferred tsconfig file used for typescript declaration files generation                   | -                |
| `--silent`                         |             | Disable logging during the build process                                                           | `false`          |
| `--env <mode>`                     |             | Control environment variable handling (inline, disable or PREFIX\_\*)                              | -                |
| `--config <path>`                  |             | Specify a custom path to the configuration file                                                    | -                |
| `--onSuccess <command>`            |             | Command to execute after a successful build                                                        | -                |
| `--filter <packages>`              |             | Build only specific packages in a workspace (comma-separated)                                      | -                |
| `--version`                        | `-v`        | Display version information                                                                        | -                |
| `--help`                           | `-h`        | Display help information                                                                           | -                |
