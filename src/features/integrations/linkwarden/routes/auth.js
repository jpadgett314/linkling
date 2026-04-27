import { Router } from 'express';

function createAuthRoutes() {
  const router = Router();

  router.get('/auth/csrf', (_req, res) => {
    res.json({ csrfToken: 'mock-csrf-token' });
  });

  router.get('/auth/session', (_req, res) => {
    res.json({
      user: {
        id: 1,
        name: 'Mock User',
        username: 'mock',
      },
    });
  });

  router.post('/session', (req, res) => {
    res.json({
      response: {
        token: 'mock-token-from-username-password',
      },
    });
  });

  return router;
}

export { createAuthRoutes };

