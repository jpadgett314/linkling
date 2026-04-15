import { response, Router } from 'express';
import multer from 'multer';
import { BookmarkService } from './BookmarkService.js';
import { mapCollection, mapTag, mapStoredLink, mapSearchLink } from './linkwardenMappers.js';

function createBookmarkRoutes(library) {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });
  const bookmarkService = new BookmarkService(library);

  router.get('/collections', (req, res) => {
    console.log('GET /collections');
    console.log(`body=${JSON.stringify(req.body)}`);
    console.log(`query=${JSON.stringify(req.query)}`);
    const metadata = library.getAllMetadata();
    res.json({ response: metadata.map((m) => mapCollection(m)) });
  });

  router.get('/tags', (req, res) => {
    console.log('GET /tags');
    const tags = library.getAllTags();
    res.json({ response: tags.map((name, idx) => mapTag(name, idx)) });
  });

  router.get('/search', async (req, res) => {
    console.log('GET /search');
    console.log(`body=${JSON.stringify(req.body)}`);
    console.log(`query=${JSON.stringify(req.query)}`);
    const results = await bookmarkService.searchLinks(req.query.searchQueryString);
    res.json({
      data: {
        links: results.map((r, idx) => mapSearchLink(r, idx)),
      },
    });
  });

  router.get('/links', (req, res) => {
    console.log('GET /links');
    console.log(`body=${JSON.stringify(req.body)}`);
    console.log(`query=${JSON.stringify(req.query)}`);
    const { cursor, collectionId } = req.query;
    if (collectionId) {
      const cdata = library.getMetadata(collectionId);
      const links = library.getBookmarks(collectionId);
      const response = links.map((l, idx) => mapSearchLink(l, cdata, idx));
      //console.log(response);
      res.json({ response: [ response[cursor] ] });
    } else {
      return {};
    }
  });

  router.put('/links/:id', (req, res) => {
    console.log('PUT /links/:id');
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
    console.log('DELETE /links/:id');
    res.json({ response: { ok: true } });
  });

  router.post('/links', async (req, res) => {
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

  router.post('/archives/:id', upload.single('file'), (req, res) => {
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

export { createBookmarkRoutes };
