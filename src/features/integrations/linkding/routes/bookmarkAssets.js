import { Router } from 'express';

/**
 * Stubbed routes for unimplemented Bookmark Assets feature
 * @returns {Router}
 */
function createBookmarkAssetsRoutes() {
  const router = Router();

  /*
   * List Assets
   */
  router.get('/:bookmark_id/assets/', (req, res) => {
    const response = {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
    res.json(response);
  });

  /*
   * Upload Asset
   */
  router.post('/:bookmark_id/assets/upload/', (req, res) => {
    const { bookmark_id } = req.params;

    res.status(201).json({
      id: 0,
      bookmark: parseInt(bookmark_id),
      asset_type: "upload",
      date_created: new Date().toISOString(),
      content_type: "text/plain",
      display_name: "fake_file.txt",
      status: "complete"
    });
  });

  /*
   * Retrieve Asset
   */
  router.get('/:bookmark_id/assets/:id/', (req, res) => {
    res.status(404).json({ detail: "Not found." });
  });

  /*
   * Download Asset
   */
  router.get('/:bookmark_id/assets/:id/download/', (req, res) => {
    res.status(404).json({ detail: "File not found." });
  });

  /*
   * Delete Asset
   */
  router.delete('/:bookmark_id/assets/:id/', (req, res) => {
    res.status(204).send();
  });

  return router;
}

export { createBookmarkAssetsRoutes };
