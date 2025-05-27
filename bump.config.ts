import { defineConfig } from 'bumpp'

export default defineConfig({
	files: ['package.json'],
	commit: true,
	push: true,
	tag: true,
})
