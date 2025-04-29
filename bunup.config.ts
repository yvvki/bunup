const COMMON_OPTIONS = {
	outDir: 'dist',
	minify: true,
	splitting: false,
	target: 'bun',
}

export default [
	{
		name: 'bunup',
		root: 'packages/bunup',
		config: [
			{
				...COMMON_OPTIONS,
				format: ['esm', 'cjs'],
				entry: {
					index: 'src/index.ts',
					plugins: 'src/plugins/built-in/index.ts',
				},
				dts: true,
			},
			{
				...COMMON_OPTIONS,
				entry: { cli: 'src/cli/index.ts' },
				format: ['esm'],
			},
		],
	},
	{
		name: 'create-bunup',
		root: 'packages/create-bunup',
		config: [
			{
				...COMMON_OPTIONS,
				format: ['esm'],
				entry: ['src/index.ts'],
			},
		],
	},
]
