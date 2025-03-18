import {Entry} from '../options';
import {generateRandomSuffix} from '../utils';

export type ProcessableEntry = {
    name: string;
    path: string;
};

export function getEntryNameOnly(entry: string) {
    return entry.split('/').pop()?.split('.').slice(0, -1).join('.') || '';
}

export function normalizeEntryToProcessableEntries(
    entry: Entry,
): ProcessableEntry[] {
    const result: ProcessableEntry[] = [];
    const usedNames = new Set<string>();

    function addEntry(name: string, path: string) {
        if (usedNames.has(name)) {
            const randomSuffix = generateRandomSuffix();
            result.push({name: `${name}_${randomSuffix}`, path});
        } else {
            result.push({name, path});
            usedNames.add(name);
        }
    }

    if (Array.isArray(entry)) {
        for (const item of entry) {
            const name = getEntryNameOnly(item);
            addEntry(name, item);
        }
    } else {
        Object.entries(entry).forEach(([name, path]) => {
            addEntry(name, path as string);
        });
    }

    return result;
}

export function getEntryNamingFormat(name: string, extension: string) {
    return `[dir]/${name}${extension}`;
}
