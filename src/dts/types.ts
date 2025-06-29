import type { IsolatedDeclarationError } from './logger'

export type Resolve = boolean | (string | RegExp)[]

export type Naming =
	| string
	| {
			entry: string
			chunk: string
	  }

export type GenerateDtsOptions = {
	preferredTsConfigPath?: string
	resolve?: Resolve
	cwd?: string
	splitting?: boolean
	minify?: boolean
}

export type GenerateDtsResultFile = {
	kind: 'entry-point' | 'chunk'
	entrypoint: string | undefined
	chunkFileName: string | undefined
	outputPath: string
	pathInfo: {
		outputPathWithoutExtension: string
		ext: string
	}
	dts: string
}

export type GenerateDtsResult = {
	files: GenerateDtsResultFile[]
	errors: IsolatedDeclarationError[]
}
