import { defineConfig } from 'bumpp'

export default defineConfig({
	files: ['package.json'],
	commit: 'chore: %s',
	push: true,
	tag: true,
})
