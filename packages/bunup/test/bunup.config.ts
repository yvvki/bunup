import { defineWorkspace } from '../src'

export default defineWorkspace([
	{
		name: 'fix',
		root: 'fixtures',
		config: {
			jsx: {
				development: true,
			},
		},
	},
])
