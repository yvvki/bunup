# Copy

This plugin copies files and directories to the output directory after each build. It supports glob patterns for flexible file selection. If no destination is specified, files are copied to the build output directory.

## Usage

```ts [bunup.config.ts]
import { defineConfig } from 'bunup';
import { copy } from 'bunup/plugins';

export default defineConfig({
	entry: ['src/index.ts'],
	plugins: [copy(['README.md', 'assets/**/*'])],
});
```

**Basic copying:**
```ts
copy(['README.md', 'assets/**/*'])
```

**Copy and rename a file:**
```ts
copy(['README.md'], 'dist/documentation.md')
```

**Copy to a specific directory:**
```ts
copy(['assets/**/*'], 'dist/static')
```
