import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { ConfigurationRegistry } from './features/configuration/ConfigurationRegistry.js';
import { Library } from './features/library/Library.js';
import { createConfigurationRoutes } from './features/configuration/routes.js';
import { createAuthRoutes } from './features/auth/routes.js';
import { createBookmarkRoutes } from './features/library/routes.js';

/**
 * @returns {express.Express}
 */
function create(registry, library) {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/', createConfigurationRoutes(registry));
  app.use('/api/v1', createAuthRoutes());
  app.use('/api/v1', createBookmarkRoutes(library));
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.originalUrl });
  });

  return app;
}

class LinklingServer {
  /**
   * @param {ConfigurationRegistry} registry
   * @param {Library} library
   */
  constructor(registry, library) {
    /** @type {ConfigurationRegistry} */
    this._registry = registry;
    /** @type {Library} */
    this._library = library;
    /** @type {Express} */
    this._express = create(registry, library);
    /** @type {import('node:http').Server  | null} */
    this._server = null;
  }

  async start({port, host}) {
    const server = http.createServer(this._express);

    await new Promise((resolve, reject) => {
      server.listen(port, host);
      server.once('listening', resolve);
      server.once('error', reject);
    });

    this._server = server;

    console.log(`Linkling listening on http://${host}:${port}`);

    // const addr = server.address();
    // const boundPort = typeof addr === 'object' ? addr.port : port;
    // return { server, port: boundPort };
  }

  async startLocal() {
    await this.start({
      port: this._registry.get('port'),
      host: '127.0.0.1',
    });
  }

  async startPublic() {
    await this.start({
      port: this._registry.get('port'),
      host: '0.0.0.0',
    });
  }

  async stop() {
    // TODO: `setTimeout` and `process.on('SIGTERM', () => {})`
    return new Promise((resolve) => {
      this._server.close(() => resolve());
      this._server = null;
    })
  }

}

export { LinklingServer };
