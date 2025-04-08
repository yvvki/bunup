import type {
    Arrayable,
    DefineConfigEntry,
    DefineWorkspaceEntry,
} from "./types";

export function defineConfig(
    options: Arrayable<DefineConfigEntry>,
): Arrayable<DefineConfigEntry> {
    return options;
}

export function defineWorkspace(
    options: DefineWorkspaceEntry[],
): DefineWorkspaceEntry[] {
    return options;
}
