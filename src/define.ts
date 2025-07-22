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
		const config =
			item.config && Array.isArray(item.config)
				? item.config.map((config) => ({
						...sharedOptions,
						...config,
					}))
				: item.config
					? { ...sharedOptions, ...item.config }
					: sharedOptions
		return { ...item, config }
	})
}
