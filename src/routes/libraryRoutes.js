import { Router } from 'express';
import multer from 'multer';
import { BookmarkService } from '../services/bookmarkService.js';
import { mapCollection, mapTag, mapStoredLink, mapSearchLink } from '../mappers/linkwardenMapper.js';

function logAuth(req) {
  const auth = req.headers.authorization;
  console.log('Authorization:', auth ?? '(none)');
}

function createLibraryRoutes(library) {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });
  const bookmarkService = new BookmarkService(library);

  router.get('/collections', (req, res) => {
    logAuth(req);
    const now = new Date().toISOString();
    const metadata = library.getAllMetadata();
    res.json({ response: metadata.map((m) => mapCollection(m, now)) });
  });

  router.get('/tags', (req, res) => {
    logAuth(req);
    const now = new Date().toISOString();
    const tags = library.getAllTags();
    res.json({ response: tags.map((name, idx) => mapTag(name, idx, now)) });
  });

  router.post('/links', async (req, res) => {
    logAuth(req);
    console.log('Bookmark payload:', JSON.stringify(req.body, null, 2));

    try {
      const saved = await bookmarkService.createFromBody(req.body);
      res.status(201).json({ response: mapStoredLink(saved) });
    } catch (err) {
      console.error('Error saving bookmark:', err);
      const message = err instanceof Error ? err.message : '';
      if (message.startsWith('Collection not found:')) {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: 'Failed to save bookmark' });
    }
  });

  router.put('/links/:id', (req, res) => {
    logAuth(req);
    console.log('Bookmark payload:', JSON.stringify(req.body, null, 2));
    res.json({
      response: {
        id: Number(req.params.id),
        collectionId: 1,
        ...req.body,
      },
    });
  });

  router.delete('/links/:id', (req, res) => {
    logAuth(req);
    res.json({ response: { ok: true } });
  });

  router.get('/search', async (req, res) => {
    logAuth(req);
    const results = await bookmarkService.searchLinks(req.query.searchQueryString);
    res.json({
      data: {
        links: results.map((r, idx) => mapSearchLink(r, idx)),
      },
    });
  });

  router.post('/archives/:id', upload.single('file'), (req, res) => {
    logAuth(req);
    const file = req.file;
    console.log('Archive upload:', {
      linkId: req.params.id,
      format: req.query.format,
      file: file
        ? { fieldname: file.fieldname, size: file.size, mimetype: file.mimetype }
        : null,
    });
    res.json({ response: { ok: true } });
  });

  return router;
}

export { createLibraryRoutes };
