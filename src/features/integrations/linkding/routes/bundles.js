import { Router } from 'express';

/**
 * Stubbed routes for unimplemented Bundles feature
 * @returns {Router}
 */
function createBundlesRoutes() {
  const router = Router();

  /*
   * List Bundles
   */
  router.get('/', (req, res) => {
    // const limit = parseInt(req.query.limit) || 100;
    // const offset = parseInt(req.query.offset) || 0;

    res.json({
      count: 0,
      next: null,
      previous: null,
      results: []
    });
  });

  /*
   * Create Bundle
   */
  router.post('/', (req, res) => {
    const { name, search, any_tags, all_tags, excluded_tags, order } = req.body;

    res.status(201).json({
      id: 0,
      name: name || "Fake Bundle",
      search: search || "",
      any_tags: any_tags || "",
      all_tags: all_tags || "",
      excluded_tags: excluded_tags || "",
      order: order ?? 0,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString()
    });
  });

  /*
   * Retrieve Bundle
   */
  router.get('/:id', (req, res) => {
    res.status(404).json({ detail: "Bundle not found." });
  });

  /*
   * Update Bundle (Full)
   */
  router.put('/:id', (req, res) => {
    res.status(404).json({ detail: "Bundle not found." });
  });

  /*
   * Update Bundle (Partial)
   */
  router.patch('/:id', (req, res) => {
    res.status(404).json({ detail: "Bundle not found." });
  });

  /*
   * Delete Bundle
   */
  router.delete('/:id', (req, res) => {
    res.status(204).send();
  });

  return router;
}

export { createBundlesRoutes };
