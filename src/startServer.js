import { ConfigurationRegistry } from './configuration/ConfigurationRegistry.js';
import { LibraryFactory } from './LibraryFactory.js';
import { createServer } from './server.js';

async function startServer(port = Number(process.env.PORT) || 3000) {
  const registry = new ConfigurationRegistry()
  await registry.init();
  const libraryFactory = new LibraryFactory(registry.get('libraryDirectory'));
  const library = await libraryFactory.makeLibrary();
  const expressApp = createServer(registry, library);

  return new Promise((resolve, reject) => {
    const server = expressApp.listen(port, () => {
      const addr = server.address();
      const boundPort =
        typeof addr === 'object' && addr !== null ? addr.port : port;
      resolve({ server, port: boundPort });
    });
    server.once('error', reject);
  });
}

export { startServer };
