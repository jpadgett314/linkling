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

  router.get('/collections', (req, res) => {
    const metadata = library.BookmarkCollections.find({});
    res.json({ response: metadata.map((m) => mapCollection(m)) });
  });

  router.get('/tags', (req, res) => {
    const tags = library.Tags.find({});
    res.json({ response: tags.map((name, idx) => mapTag(name, idx)) });
  });

  router.post('/archives/:id', upload.single('file'), (req, res) => {
    const file = req.file;
    res.json({ response: { ok: true } });
  });

  return router;
}

export { createUncategorizedRoutes };
