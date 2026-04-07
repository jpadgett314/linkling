import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { ConfigFileSchema } from './schema.js';

async function loadConfig() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const configPath = path.join(projectRoot, 'config.json');
  const rawConfig = await fs.readFile(configPath, 'utf8');
  const parsedConfig = ConfigFileSchema.parse(JSON.parse(rawConfig));

  return {
    projectRoot,
    configPath,
    collectionsDir: path.resolve(projectRoot, parsedConfig.collectionDirectory ?? './collections'),
  };
}

export { loadConfig };
