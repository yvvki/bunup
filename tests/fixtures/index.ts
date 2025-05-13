import('./utils').then(({ createFixture }) => {
	createFixture('hello')
})

export function hello() {
	return 'hello'
}

export * from '@/utils'

export const dirname: string = __dirname
export const filename: string = __filename
export const url: string = import.meta.url
