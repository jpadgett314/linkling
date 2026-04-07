import { LibraryFactory } from './LibraryFactory.js';
import { createServer } from './server.js';
import { loadConfig } from './configuration/loadConfig.js';

const PORT = Number(process.env.PORT) || 3000;

const { collectionsDir } = await loadConfig();
const libraryFactory = new LibraryFactory(collectionsDir);
const library = await libraryFactory.makeLibrary();
const app = createServer(library);

app.listen(PORT, () => {
  console.log(`Linkling listening on http://localhost:${PORT}`);
});
