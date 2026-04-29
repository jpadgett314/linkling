import { Router } from 'express';
import { BookmarkService } from '../services/BookmarkService.js';
import { mapStoredLink, mapSearchLink } from './common/mappers.js';
import { Library } from '../../../library/Library.js';

/**
 * @param {Library} library
 * @returns {Router}
 */
function createLinksRoutes(library) {
  const router = Router();
  const bookmarkService = new BookmarkService(library);

  router.get('/links', async (req, res) => {
    const { cursor, collectionId } = req.query;
    if (collectionId) {
      const cdata = await library.BookmarkCollections.find({ collectionId });
      const links = await library.Bookmarks.find({ collectionId });
      const response = links.map(l => mapSearchLink(l, cdata));
      res.json({ response: [ response[cursor] ] });
    } else {
      return {};
    }
  });

  router.put('/links/:id', (req, res) => {
    res.json({
      response: {
        id: Number(req.params.id),
        collectionId: 1,
        ...req.body,
      },
    });
  });

  router.delete('/links/:id', (req, res) => {
    res.json({ response: { ok: true } });
  });

  router.post('/links', async (req, res) => {
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

  router.get('/search', async (req, res) => {
    const links = await bookmarkService.searchLinks(req.query.searchQueryString);
    const linkData = await Promise.all(
      links.map(async bookmark => {
        return mapSearchLink(
          bookmark,
          await library.BookmarkCollections.find({ collectionId: bookmark.collectionId })
        );
      })
    );
    res.json({ data: { links: linkData } });
  });

 return router;
}

export { createLinksRoutes };
