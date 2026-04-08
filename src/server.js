import express from 'express';
import cors from 'cors';
import { createAuthRoutes } from './features/auth/routes.js';
import { createBookmarkRoutes } from './features/library/routes.js';
import { createConfigurationRoutes } from './features/configuration/routes.js';

function createServer(registry, library) {
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

export { createServer };
