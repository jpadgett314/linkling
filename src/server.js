import express from 'express';
import cors from 'cors';
import { createAuthRoutes } from './routes/auth.js';
import { createBookmarkRoutes } from './routes/bookmarks.js';

function createServer(library) {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/v1', createAuthRoutes());
  app.use('/api/v1', createBookmarkRoutes(library));

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.originalUrl });
  });

  return app;
}

export { createServer };
