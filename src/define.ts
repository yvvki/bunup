import {DefineConfigEntry, DefineWorkspaceEntry} from './types';

export function defineConfig(
      options: DefineConfigEntry | DefineConfigEntry[],
): DefineConfigEntry | DefineConfigEntry[] {
      return options;
}

export function defineWorkspace(
      options: DefineWorkspaceEntry[],
): DefineWorkspaceEntry[] {
      return options;
}
