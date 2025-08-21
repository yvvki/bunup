'use client'

import type { PropsWithChildren } from 'react'

export function Button({ children }: PropsWithChildren): React.ReactNode {
	return (
		<button type="button" data-slot="button">
			{children}
		</button>
	)
}
