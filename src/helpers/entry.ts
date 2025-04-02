import {logger} from '../logger';
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
      const nameToPath: Record<string, string> = {};

      function addEntry(name: string, path: string) {
            if (usedNames.has(name)) {
                  const randomSuffix = generateRandomSuffix();
                  const newName = `${name}_${randomSuffix}`;
                  logger.warn(
                        `Output name conflict: "${name}" is used by multiple files.\n` +
                              `Bunup uses filenames without extensions as output names by default.\n\n` +
                              `${nameToPath[name]} -> ${name}.js\n` +
                              `${path} -> ${newName}.js (auto-renamed to avoid conflict)\n` +
                              `\n` +
                              `To fix this, use named entries in your configuration:\n` +
                              `{\n` +
                              `  entry: {\n` +
                              `    custom_name: "${nameToPath[name]}",\n` +
                              `    another_name: "${path}"\n` +
                              `  }\n` +
                              `}\n\n` +
                              `See: https://bunup.arshadyaseen.com/#using-a-configuration-file-with-named-entries`,
                        {
                              muted: true,
                              verticalSpace: true,
                        },
                  );
                  result.push({name: newName, path});
            } else {
                  result.push({name, path});
                  usedNames.add(name);
                  nameToPath[name] = path;
            }
      }

      if (Array.isArray(entry)) {
            for (const item of entry) {
                  const name = getEntryNameOnly(item);
                  addEntry(name, item);
            }
      } else if (typeof entry === 'object') {
            Object.entries(entry).forEach(([name, path]) => {
                  addEntry(name, path as string);
            });
      } else {
            const name = getEntryNameOnly(entry);
            addEntry(name, entry);
      }

      return result;
}

export function getEntryNamingFormat(name: string, extension: string) {
      return `[dir]/${name}${extension}`;
}
