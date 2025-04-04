#!/usr/bin/env node
import fs from 'fs/promises';
import https from 'https';
import path from 'path';

const JSON_FILE = path.join(
      __dirname,
      'src',
      'starter-root-dev-dependencies.json',
);

console.log(JSON_FILE);

const DEPENDENCIES = [
      '@biomejs/biome',
      '@commitlint/cli',
      '@commitlint/config-conventional',
      'bunup',
      'bumpp',
      'husky',
      'typescript',
      'vitest',
];

async function getLatestVersion(packageName: string) {
      return new Promise((resolve, reject) => {
            const url = `https://registry.npmjs.org/${packageName}`;

            https.get(url, res => {
                  let data = '';

                  res.on('data', chunk => {
                        data += chunk;
                  });

                  res.on('end', () => {
                        try {
                              const packageInfo = JSON.parse(data);
                              const latestVersion =
                                    packageInfo['dist-tags'].latest;
                              console.log(
                                    `Latest version of ${packageName}: ${latestVersion}`,
                              );
                              resolve(latestVersion);
                        } catch (error: any) {
                              console.error(
                                    `Error parsing response for ${packageName}:`,
                                    error.message,
                              );
                              reject(error);
                        }
                  });
            }).on('error', error => {
                  console.error(
                        `Error fetching ${packageName}:`,
                        error.message,
                  );
                  reject(error);
            });
      });
}

async function updateDependencies() {
      try {
            console.log('Updating dependency versions...');

            let dependencies: Record<string, string> = {};
            try {
                  const fileContent = await fs.readFile(JSON_FILE, 'utf8');
                  if (fileContent.trim()) {
                        dependencies = JSON.parse(fileContent);
                  }
            } catch (error: any) {
                  console.log('Creating new dependencies file...');
            }

            for (const dep of DEPENDENCIES) {
                  try {
                        const latestVersion = await getLatestVersion(dep);
                        dependencies[dep] = `^${latestVersion}`;
                  } catch (error: any) {
                        console.warn(
                              `Could not get latest version for ${dep}, skipping`,
                        );
                  }
            }

            await fs.writeFile(
                  JSON_FILE,
                  JSON.stringify(dependencies, null, 2) + '\n',
                  'utf8',
            );

            console.log('Dependency versions updated successfully!');
      } catch (error: any) {
            console.error('Error updating dependencies:', error.message);
            process.exit(1);
      }
}

updateDependencies();
