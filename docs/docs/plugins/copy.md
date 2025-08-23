# Copy

The copy plugin copies files and directories to your build output. It supports glob patterns and can copy to specific destinations or rename files.

## Basic Usage

```ts [bunup.config.ts]
import { defineConfig } from 'bunup';
import { copy } from 'bunup/plugins';

export default defineConfig({
	entry: 'src/index.ts',
	plugins: [copy(['README.md', 'assets/**/*'])],
});
```

## Examples

**Copy multiple files to output directory:**
```ts
copy(['README.md', 'assets/**/*'])
```

**Copy and rename a file:**
```ts
copy('README.md', 'dist/documentation.md')
```

**Copy files to a specific folder:**
```ts
copy('assets/**/*', 'dist/static')
```

**Copy with glob patterns:**
```ts
copy([
	'*.md',           // All markdown files
	'assets/**/*',    // All files in assets folder
	'!*.tmp'         // Exclude temporary files
])
```

## Parameters

- **`pattern`** - String or array of strings with glob patterns
- **`outPath`** - Optional destination path (file or folder)

If no destination is specified, files are copied to your build output directory.
