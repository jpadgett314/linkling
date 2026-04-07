import { CollectionDirectory } from './CollectionDirectory.js';
import { Library } from './Library.js';
import { createServer } from './server.js';
import { loadConfig } from './config/loadConfig.js';

const PORT = Number(process.env.PORT) || 3000;

const { collectionsDir } = await loadConfig();
const collectionDirectory = new CollectionDirectory(collectionsDir);
await collectionDirectory.initialize();
const library = new Library(collectionDirectory.collections);
library.init();

const app = createServer(library);

app.listen(PORT, () => {
  console.log(`Mock Linkwarden listening on http://localhost:${PORT}`);
  console.log('Point the extension base URL at that address (no trailing slash).');
});
