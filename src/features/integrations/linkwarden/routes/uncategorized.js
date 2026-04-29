import { Router } from 'express';
import multer from 'multer';
import { mapCollection, mapTag } from './common/mappers.js';
import { Library } from '../../../library/Library.js';

/**
 * @param {Library} library
 * @returns {Router}
 */
function createUncategorizedRoutes(library) {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });

  router.get('/collections', async (req, res) => {
    const metadata = await library.BookmarkCollections.find({});
    res.json({ response: metadata.map((m) => mapCollection(m)) });
  });

  router.get('/tags', async (req, res) => {
    const tags = await library.Tags.find({});
    res.json({ response: tags.map((tag, idx) => mapTag(tag, idx)) });
  });

  router.get('/config', (req, res) => {
    res.json({
      DISABLE_REGISTRATION: false,
      ADMIN: 1,
      RSS_POLLING_INTERVAL_MINUTES: 10,
      EMAIL_PROVIDER: false,
      MAX_FILE_BUFFER: 0,
      USER_CONTENT_DOMAIN: '',
      AI_ENABLED: false,
      INSTANCE_VERSION: '0.0.0'
    });
  });

  router.post('/archives/:id', upload.single('file'), (req, res) => {
    const file = req.file;
    res.json({ response: { ok: true } });
  });

  return router;
}

export { createUncategorizedRoutes };
