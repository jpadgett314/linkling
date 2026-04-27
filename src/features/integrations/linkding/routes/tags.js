import { Router } from 'express';
import { Library } from '../../../library/Library.js';
import { mapTag } from './common/mappers.js';
import { getPaginationUrls } from './common/pagination.js';

/**
 * Tags Routes
 * @param {Library} library
 * @returns {Router}
 */
function createTagsRoutes(library) {
  const router = Router();

  /*
   * List Tags
   */
  router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const result = await library.Tags.find({});

    const sliced = result.slice(offset, offset + limit);

    const tagObjects = sliced.map(tag => mapTag(tag));

    const { next, previous } = getPaginationUrls(
      `${req.protocol}://${req.get('host')}${req.baseUrl}`,
      limit,
      offset,
      result.length
    );

    res.json({ count: result.length, next, previous, tagObjects });
  });

  /*
   * Retrieve Tag
   */
  router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const result = (await library.Tags.find({ id }))[0];

    if (result) {
      res.json(mapTag(result));
    } else {
      res.status(404).json({ detail: "Tag not found." });
    }
  });

  /*
   * Create Tag
   */
  router.post('/', (req, res) => {
    res.status(201).json({
      id: 999,
      name: req.body.name || "fake-tag",
      date_added: new Date().toISOString()
    });
  });

  return router;
}

export { createTagsRoutes };
