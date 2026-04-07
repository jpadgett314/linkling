import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { CollectionDirectory } from './CollectionDirectory.js';
import { Library } from './Library.js';
import { createServer } from './server.js';

const PORT = Number(process.env.PORT) || 3000;

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(projectRoot, 'config.json');
const rawConfig = await fs.readFile(configPath, 'utf8');
const parsedConfig = JSON.parse(rawConfig);
const collectionsDir = path.resolve(projectRoot, parsedConfig.collectionDirectory ?? './collections');
const collectionDirectory = new CollectionDirectory(collectionsDir);
await collectionDirectory.initialize();
const library = new Library(collectionDirectory.collections);
library.init();

const app = createServer(library);

app.listen(PORT, () => {
  console.log(`Mock Linkwarden listening on http://localhost:${PORT}`);
  console.log('Point the extension base URL at that address (no trailing slash).');
});
