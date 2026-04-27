import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { ConfigurationRegistry } from './features/settings/ConfigurationRegistry.js';
import { Library } from './features/library/Library.js';
import { createConfigurationRoutes } from './features/settings/routes.js';
import { createLinkdingRoutes } from './features/integrations/linkding/index.js';
import { createLinkwardenRoutes } from './features/integrations/linkwarden/index.js';

function createLogger() {
  return (req, _res, next) => {
    console.log("---- Incoming Request ----");
    console.log("Time:", new Date().toISOString());
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Params:", req.params);
    console.log("Query:", req.query);
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);
    next();
  };
}

/**
 * @returns {express.Express}
 */
function create(registry, library) {
  const app = express();
  const linklingRouter = createLinkdingRoutes(library);
  const linkwardenRouter = createLinkwardenRoutes(library);
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(createLogger());
  app.use('/', createConfigurationRoutes(registry));
  app.use('/', linklingRouter);
  app.use('/', linkwardenRouter);
  app.use('/linkding', linklingRouter);
  app.use('/linkwarden', linkwardenRouter);
  app.use((req, res) => {
    console.log("Route not found.");
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
