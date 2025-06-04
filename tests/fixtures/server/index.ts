import type { createFixture } from '@/utils'

export function server() {
	return 'server'
}

export type Fixture = ReturnType<typeof createFixture>
