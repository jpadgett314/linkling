import { Router } from 'express';
import { createBookmarkAssetsRoutes } from './routes/bookmarkAssets.js';
import { createBookmarksRoutes } from './routes/bookmarks.js';
import { createBundlesRoutes } from './routes/bundles.js';
import { createTagsRoutes } from './routes/tags.js';
import { createUserRouters } from './routes/userPreferences.js';

function createLinkdingRoutes(library) {
  const router = Router();
  router.use('/api/bookmarks', createBookmarksRoutes(library));
  router.use('/api/bookmarks', createBookmarkAssetsRoutes());
  router.use('/api/tags', createTagsRoutes(library));
  router.use('/api/bundles', createBundlesRoutes());
  router.use('/api/user', createUserRouters());
  return router;
}

export { createLinkdingRoutes };
