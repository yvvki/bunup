import { readFileSync } from 'node:fs'

import('./utils').then(({ createFixture }) => {
    createFixture('hello')
})

export function hello() {
    return 'hello'
}

export * from 'fixtures/utils'

export const dirnames: string = __dirname
export const filenames: string = __filename
export const urls: string = import.meta.url

console.log(readFileSync('bun.lockb', 'utf-8'))
