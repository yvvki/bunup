import type { Arrayable, DefineConfigItem, DefineWorkspaceItem } from './types'

export function defineConfig(
	options: Arrayable<DefineConfigItem>,
): Arrayable<DefineConfigItem> {
	return options
}

export function defineWorkspace(
	options: DefineWorkspaceItem[],
	sharedOptions?: DefineConfigItem,
): DefineWorkspaceItem[] {
	return options.map((item) => {
		const config = Array.isArray(item.config)
			? item.config.map((config) => ({
					...sharedOptions,
					...config,
				}))
			: { ...sharedOptions, ...item.config }
		return { ...item, config }
	})
}
