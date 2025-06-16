import { Chalk } from 'chalk'

function sum(a: number, b: number) {
	return a + b
}

export function hello(): number {
	return sum(1, 2)
}

export const chalk = new Chalk()
