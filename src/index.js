import { Library } from './features/library/Library.js';
import { ConfigurationRegistry } from './features/configuration/ConfigurationRegistry.js';
import { LinklingServer } from './LinklingServer.js';

async function init() {
  const registry = new ConfigurationRegistry();
  const library = new Library([]);
  const server = new LinklingServer(registry, library);

  await registry.init();
  await library.init(registry.get('libraryDirectory'));
  await server.startLocal();
}

await init();
