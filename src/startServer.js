import { ConfigurationRegistry } from './features/configuration/ConfigurationRegistry.js';
import { LibraryFactory } from './features/library/LibraryFactory.js';
import { createServer } from './server.js';

async function startServer(port, host) {
  const registry = new ConfigurationRegistry()
  await registry.init();
  const libraryFactory = new LibraryFactory(registry.get('libraryDirectory'));
  const library = await libraryFactory.makeLibrary();
  const expressApp = createServer(registry, library);

  return new Promise((resolve, reject) => {
    const server = expressApp.listen(port, host, () => {
      const addr = server.address();
      const boundPort =
        typeof addr === 'object' && addr !== null ? addr.port : port;
      resolve({ server, port: boundPort });
    });
    server.once('error', reject);
  });
}

export { startServer };
