import type { createFixture } from '@/utils'

export function client() {
	return 'client'
}

export type Fixture2 = ReturnType<typeof createFixture>
