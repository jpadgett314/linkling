import { Router } from 'express';
import { Library } from '../../../library/Library.js';
import { getPaginationUrls } from './common/pagination.js';
import { mapBookmark, mapBookmarkInput } from './common/mappers.js';

/**
 * Routes for creating, reading, updating and deleting bookmarks
 * @param {Library} library
 * @returns {Router}
 */
function createBookmarksRoutes(library) {
  const router = Router();

  /*
   * List Bookmarks
   */
  router.get('/', async (req, res) => {
    const { q, modified_since, added_since, bundle } = req.query;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const result = await library.Bookmarks.find({});

    const sliced = result.slice(offset, offset + limit);

    const linkObjects = sliced.map(b => mapBookmark(b));

    const { next, previous } = getPaginationUrls(
      `${req.protocol}://${req.get('host')}${req.baseUrl}`,
      limit,
      offset,
      result.length
    );

    res.json({ count: result.length, next, previous, results: linkObjects });
  });

  /*
   * List Archived Bookmarks
   */
  router.get('/archived', (req, res) => {
    const { q, limit = 100, offset = 0, modified_since, added_since, bundle } = req.query;

    res.json({ count: 0, next: null, previous: null, results: [] });
  });

  /*
   * Check URL status
   */
  router.get('/check', async (req, res) => {
    const url = String(req.query.url).trim();

    const result = (await library.Bookmarks.find({ url }))[0];

    res.json({
      bookmark: result ? mapBookmark(result): null,
      metadata: { title: null, description: null },
      auto_tags: []
    });
  });

  /*
   * Retrieve Bookmark
   */
  router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const result = (await library.Bookmarks.find({ id }))[0];

    if (result) {
      res.json(mapBookmark(result));
    } else {
      res.status(404).json({ detail: "Not found." });
    }
  });

  /*
   * Create Bookmark
   */
  router.post('/', async (req, res) => {
    const { disable_scraping } = req.query;

    const bookmark = mapBookmarkInput(req.body);

    const result = await library.Bookmarks.save(bookmark);

    if (result) {
      res.status(201).json(mapBookmark(result));
    } else {
      res.status(422).json({ detail: "Not saveable."});
    }
  });

  /*
   * Update Bookmark (Full)
   */
  router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const bookmark = mapBookmarkInput({ id, ...req.body });

    const result = await library.Bookmarks.save(bookmark);

    if (result) {
      res.json(mapBookmark(result));
    } else {
      res.status(422).json({ detail: "Not saveable."});
    }
  });

  /*
   * Update Bookmark (Partial)
   */
  router.patch('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const bookmark = mapBookmarkInput({ id, ...req.body });

    const result = await library.Bookmarks.save(bookmark);

    if (result) {
      res.json(mapBookmark(result));
    } else {
      res.status(422).json({ detail: "Not saveable."});
    }
  });

  /*
   * Archive Bookmark
   */
  router.post('/:id/archive', (req, res) => {
    const id = parseInt(req.params.id);
    res.json({ message: `Bookmark ${id} archived.` });
  });

  /*
   * Unarchive Bookmark
   */
  router.post('/:id/unarchive', (req, res) => {
    const id = parseInt(req.params.id);
    res.json({ message: `Bookmark ${id} unarchived.` });
  });

  /*
   * Delete Bookmark
   */
  router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const result = (await library.Bookmarks.delete({ id }))[0];

    if (result) {
      res.status(204).json(mapBookmark(result));
    } else {
      res.status(404).json({ detail: "Not found." });
    }
  });

  return router;
}

export { createBookmarksRoutes };
