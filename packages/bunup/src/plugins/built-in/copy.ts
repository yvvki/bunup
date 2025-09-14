import { basename, extname, join } from 'node:path'
import { logger } from '../../logger'
import { ensureArray } from '../../utils'
import type { BunupPlugin } from '../types'

type CopyOptions = {
	/** Whether to follow symbolic links when copying files. */
	followSymlinks?: boolean
	/** Whether to exclude dotfiles (files starting with a dot) from being copied. */
	excludeDotfiles?: boolean
}

export function copy(pattern: string | string[]): BunupPlugin & CopyBuilder {
	return new CopyBuilder(pattern)
}

class CopyBuilder {
	private _patterns: string[]
	private _destination?: string
	private _options?: CopyOptions

	constructor(pattern: string | string[]) {
		this._patterns = ensureArray(pattern)
	}

	to(destination: string): this {
		this._destination = destination
		return this
	}

	with(options: CopyOptions): this {
		this._options = options
		return this
	}

	get name() {
		return 'copy'
	}

	get hooks(): BunupPlugin['hooks'] {
		return {
			onBuildDone: async ({ options: buildOptions, meta }) => {
				let destinationPath = ''

				if (this._destination) {
					if (this._destination.startsWith(buildOptions.outDir)) {
						logger.warn(
							"You don't need to include the output directory in the destination path for the copy plugin. Files are copied to the output directory by default.",
							{
								verticalSpace: true,
							},
						)
						destinationPath = this._destination
					} else {
						destinationPath = join(buildOptions.outDir, this._destination)
					}
				} else {
					destinationPath = buildOptions.outDir
				}

				for (const pattern of this._patterns) {
					const glob = new Bun.Glob(pattern)

					for await (const scannedPath of glob.scan({
						cwd: meta.rootDir,
						dot: !this._options?.excludeDotfiles,
						onlyFiles: !isPatternFolder(pattern),
						followSymlinks: this._options?.followSymlinks,
					})) {
						const sourcePath = join(meta.rootDir, scannedPath)

						const destinationDir = resolveDestinationPath(
							destinationPath,
							scannedPath,
							meta.rootDir,
						)

						if (isPathDir(sourcePath)) {
							await copyDirectory(sourcePath, destinationDir)
						} else {
							await copyFile(sourcePath, destinationDir)
						}
					}
				}
			},
		}
	}
}

function resolveDestinationPath(
	destinationPath: string,
	scannedPath: string,
	rootDir: string,
): string {
	const fullDestinationPath = join(rootDir, destinationPath)
	const isScannedPathDir = isPathDir(scannedPath)
	const isDestinationDir = isPathDir(fullDestinationPath)

	if (isDestinationDir && !isScannedPathDir) {
		return join(fullDestinationPath, basename(scannedPath))
	}

	return fullDestinationPath
}

function isPatternFolder(pattern: string): boolean {
	return !pattern.includes('/')
}

function isPathDir(filePath: string): boolean {
	return extname(filePath) === ''
}

async function copyDirectory(
	sourcePath: string,
	destinationPath: string,
): Promise<void> {
	await Bun.$`cp -r ${sourcePath} ${destinationPath}`
}

async function copyFile(
	sourcePath: string,
	destinationPath: string,
): Promise<void> {
	const sourceFile = Bun.file(sourcePath)
	await Bun.write(destinationPath, sourceFile)
}
