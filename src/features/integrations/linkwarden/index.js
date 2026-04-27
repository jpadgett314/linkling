import { Router } from 'express';
import { Library } from '../../library/Library.js';
import { createAuthRoutes } from './routes/auth.js';
import { createLinksRoutes } from './routes/links.js';
import { createUncategorizedRoutes } from './routes/uncategorized.js';

/**
 * @param {Library} library
 * @returns {Router}
 */
function createLinkwardenRoutes(library) {
  const router = Router();
  router.use('/api/v1', createAuthRoutes());
  router.use('/api/v1', createLinksRoutes(library));
  router.use('/api/v1', createUncategorizedRoutes(library));
  return router;
}

export { createLinkwardenRoutes };
