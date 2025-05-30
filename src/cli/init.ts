import fs from 'node:fs'
import {
	confirm,
	intro,
	log,
	multiselect,
	outro,
	select,
	tasks,
	text,
} from '@clack/prompts'
import pc from 'picocolors'
import { exec } from 'tinyexec'
import { loadPackageJson } from '../loaders'
import { formatListWithAnd } from '../utils'
import { displayBunupGradientArt } from './utils'

export async function init(): Promise<void> {
	displayBunupGradientArt()
	intro(pc.bgCyan(pc.black(' Initialize bunup in an existing project ')))

	const { path: packageJsonPath } = await loadPackageJson()

	if (!packageJsonPath) {
		log.error('package.json not found')
		process.exit(1)
	}

	const entryFiles = await collectEntryFiles()
	const outputFormats = await selectOutputFormats()
	const shouldGenerateDts = await promptForTypeScriptDeclarations(entryFiles)
	const configMethod = await selectConfigurationMethod()

	await generateConfiguration(
		configMethod,
		entryFiles,
		outputFormats,
		shouldGenerateDts,
		packageJsonPath,
	)

	await handleBuildScripts(
		packageJsonPath,
		entryFiles,
		outputFormats,
		shouldGenerateDts,
		configMethod,
	)

	await tasks([
		{
			title: 'Installing bunup',
			task: async () => {
				await installBunup()
				return 'Bunup installed'
			},
		},
	])

	showSuccessOutro()
}

async function collectEntryFiles(): Promise<string[]> {
	const entryFiles: string[] = []

	while (true) {
		const entryFile = (await text({
			message:
				entryFiles.length > 0
					? 'Where is your next entry file?'
					: 'Where is your entry file?',
			placeholder: 'src/index.ts',
			defaultValue: 'src/index.ts',
			validate: (value) => {
				if (!value) return 'Entry file is required'
				if (!fs.existsSync(value)) return 'Entry file does not exist'
				if (!fs.statSync(value).isFile()) return 'Entry file must be a file'
				if (entryFiles.includes(value))
					return 'You have already added this entry file'
			},
		})) as string

		entryFiles.push(entryFile)

		const shouldAddMore = await confirm({
			message: 'Do you want to add another entry file?',
			initialValue: false,
		})

		if (!shouldAddMore) break
	}

	return entryFiles
}

async function selectOutputFormats(): Promise<string[]> {
	return (await multiselect({
		message: 'Select the output formats',
		options: [
			{ value: 'esm', label: 'ESM (.mjs)' },
			{ value: 'cjs', label: 'CommonJS (.cjs)' },
			{ value: 'iife', label: 'IIFE (.global.js)' },
		],
		initialValues: ['esm', 'cjs'],
	})) as string[]
}

async function promptForTypeScriptDeclarations(
	entryFiles: string[],
): Promise<boolean> {
	const hasTypeScriptFiles = entryFiles.some(
		(file) => file.endsWith('.ts') || file.endsWith('.tsx'),
	)

	if (!hasTypeScriptFiles) return false

	return (await confirm({
		message: 'Generate TypeScript declarations?',
		initialValue: true,
	})) as boolean
}

async function selectConfigurationMethod(): Promise<string> {
	return (await select({
		message: 'How would you like to configure Bunup?',
		options: [
			{ value: 'ts', label: 'bunup.config.ts', hint: 'Recommended' },
			{ value: 'js', label: 'bunup.config.js' },
			{ value: 'json', label: 'package.json "bunup" property' },
			{
				value: 'none',
				label: 'No config file',
				hint: 'Configure via CLI only',
			},
		],
		initialValue: 'ts',
	})) as string
}

async function generateConfiguration(
	configMethod: string,
	entryFiles: string[],
	outputFormats: string[],
	shouldGenerateDts: boolean,
	packageJsonPath: string,
): Promise<void> {
	if (configMethod === 'none') {
		log.info(
			'If you need more control (such as adding plugins or customizing output), you can always create a config file later.',
		)
		return
	}

	if (configMethod === 'ts' || configMethod === 'js') {
		await Bun.write(
			`bunup.config.${configMethod}`,
			createConfigFileContent(entryFiles, outputFormats, shouldGenerateDts),
		)
	} else if (configMethod === 'json') {
		const { data: packageJsonConfig } = await loadPackageJson()

		const updatedConfig = {
			...packageJsonConfig,
			bunup: createPackageJsonConfig(
				entryFiles,
				outputFormats,
				shouldGenerateDts,
			),
		}
		await Bun.write(packageJsonPath, JSON.stringify(updatedConfig, null, 2))
	}
}

async function handleBuildScripts(
	packageJsonPath: string,
	entryFiles: string[],
	outputFormats: string[],
	shouldGenerateDts: boolean,
	configMethod: string,
): Promise<void> {
	const { data: packageJsonConfig } = await loadPackageJson()

	const existingScripts = packageJsonConfig?.scripts ?? {}
	const newScripts = createBuildScripts(
		entryFiles,
		outputFormats,
		shouldGenerateDts,
		configMethod,
	)

	const conflictingScripts = Object.keys(newScripts).filter(
		(script) => existingScripts[script],
	)

	if (conflictingScripts.length > 0) {
		const shouldOverride = await confirm({
			message: `The ${formatListWithAnd(conflictingScripts)} ${conflictingScripts.length > 1 ? 'scripts already exist' : 'script already exists'} in package.json. Override ${conflictingScripts.length > 1 ? 'them' : 'it'}?`,
			initialValue: true,
		})

		if (!shouldOverride) {
			log.info('Skipped adding build scripts to avoid conflicts.')
			return
		}
	}

	const updatedConfig = {
		...packageJsonConfig,
		scripts: { ...existingScripts, ...newScripts },
	}

	await Bun.write(packageJsonPath, JSON.stringify(updatedConfig, null, 2))
}

function createConfigFileContent(
	entryFiles: string[],
	outputFormats: string[],
	shouldGenerateDts: boolean,
): string {
	return `import { defineConfig } from 'bunup'

export default defineConfig({
	entry: [${entryFiles.map((file) => `'${file}'`).join(', ')}],
	format: [${outputFormats.map((format) => `'${format}'`).join(', ')}],${shouldGenerateDts ? '\n\tdts: true,' : ''}
})
`
}

function createPackageJsonConfig(
	entryFiles: string[],
	outputFormats: string[],
	shouldGenerateDts: boolean,
): Record<string, any> {
	return {
		entry: entryFiles,
		format: outputFormats,
		...(shouldGenerateDts && { dts: true }),
	}
}

function createBuildScripts(
	entryFiles: string[],
	outputFormats: string[],
	shouldGenerateDts: boolean,
	configMethod: string,
): Record<string, string> {
	const cliOptions =
		configMethod === 'none'
			? ` ${entryFiles.join(' ')} --format ${outputFormats.join(',')}${shouldGenerateDts ? ' --dts' : ''}`
			: ''

	return {
		build: `bunup${cliOptions}`,
		dev: `bunup${cliOptions} --watch`,
	}
}

function showSuccessOutro(): void {
	outro(`
  ${pc.green('✨ Bunup initialized successfully! ✨')}
  
  ${pc.cyan('bun run build')} - Build your library
  ${pc.cyan('bun run dev')} - Start development mode
  
  ${pc.dim('Learn more:')} ${pc.underline('https://bunup.dev/docs')}
  
  ${pc.yellow('Happy building!')} 🚀
  `)
}

async function installBunup() {
	await exec('bun add -d bunup', [], {
		nodeOptions: { shell: true, stdio: 'pipe' },
	})
}
