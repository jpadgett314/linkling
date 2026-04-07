import { Router } from 'express';

function createConfigurationRoutes(registry) {
  const router = Router();

  router.patch('/config', async (req, res) => {
    try {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
      } else {
        await registry.update(updates);
        res.status(204).send(); // no content
      }
    } catch (err) {
      console.error('Failed to update config:', err);
      res.status(400).json({
        error: 'Failed to update config',
        details: err.message,
      });
    }
  });

  return router;
}

export { createConfigurationRoutes };
