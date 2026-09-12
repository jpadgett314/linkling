import path from 'node:path';
import { ConfigurationRegistry } from './features/settings/ConfigurationRegistry.js';
import { Library } from './features/library/Library.js';
import { LinklingServer } from './LinklingServer.js';

async function init() {
  const registry = new ConfigurationRegistry();
  const library = new Library([]);
  const server = new LinklingServer(registry, library);

  await registry.init();
  await library.init(registry.get('libraryDirectory'));
  await server.startLocal();
}

process.title = 'linkling';
process.env.LINKLING_DATA_DIR = path.join(process.cwd(),  '.linkling');

init();

