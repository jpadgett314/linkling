import express from 'express';
import cors from 'cors';
import multer from 'multer';

const PORT = Number(process.env.PORT) || 3000;
const app = express();

const upload = multer({ storage: multer.memoryStorage() });

/** @type {{ id: number, body: object }[]} */
const links = [];
let nextId = 1;

function logSection(title) {
  console.log(`\n--- ${title} ---`);
}

function logAuth(req) {
  const auth = req.headers.authorization;
  console.log('Authorization:', auth ?? '(none)');
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
// Public instance config (same shape as Linkwarden apps/web/pages/api/v1/config)
// See: https://github.com/linkwarden/linkwarden/blob/main/apps/web/pages/api/v1/config/index.ts
app.get('/api/v1/config', (req, res) => {
  logSection('GET /api/v1/config');
  res.json({
    response: {
      DISABLE_REGISTRATION: null,
      ADMIN: null,
      RSS_POLLING_INTERVAL_MINUTES: null,
      EMAIL_PROVIDER: null,
      MAX_FILE_BUFFER: null,
      AI_ENABLED: null,
      INSTANCE_VERSION: 'mock-linkwarden-server',
    },
  });
});
*/

// --- Auth (options page: API key via session, or CSRF for form login) ---

app.get('/api/v1/auth/csrf', (req, res) => {
  logSection('GET /api/v1/auth/csrf');
  res.json({ csrfToken: 'mock-csrf-token' });
});

app.post('/api/v1/session', (req, res) => {
  logSection('POST /api/v1/session');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  res.json({
    response: {
      token: 'mock-token-from-username-password',
    },
  });
});

app.get('/api/v1/auth/session', (req, res) => {
  logSection('GET /api/v1/auth/session');
  res.json({
    user: {
      id: 1,
      name: 'Mock User',
      username: 'mock',
    },
  });
});

// --- Collections & tags (popup loads these with Bearer token) ---

app.get('/api/v1/collections', (req, res) => {
  logSection('GET /api/v1/collections');
  logAuth(req);
  const now = new Date().toISOString();
  res.json({
    response: [
      {
        id: 1,
        name: 'Unorganized',
        color: '#6366f1',
        createdAt: now,
        description: '',
        isPublic: false,
        members: [],
        ownerId: 1,
        parent: null,
        parentId: null,
        updatedAt: now,
      },
    ],
  });
});

app.get('/api/v1/tags', (req, res) => {
  logSection('GET /api/v1/tags');
  logAuth(req);
  const now = new Date().toISOString();
  res.json({
    response: [
      {
        id: 1,
        name: 'sample-tag',
        ownerId: 1,
        createdAt: now,
        updatedAt: now,
        _count: { links: 0 },
      },
    ],
  });
});

// --- Links CRUD + search (extension core) ---

app.post('/api/v1/links', (req, res) => {
  logSection('POST /api/v1/links (save bookmark)');
  logAuth(req);
  console.log('Bookmark payload:', JSON.stringify(req.body, null, 2));

  const id = nextId++;
  const collectionId = 1;
  const stored = {
    id,
    collectionId,
    url: req.body.url,
    name: req.body.name,
    description: req.body.description,
    collection: req.body.collection ?? { name: 'Unorganized' },
    tags: req.body.tags ?? [],
    image: req.body.image,
  };
  links.push({ id, body: req.body });

  res.status(201).json({ response: stored });
});

app.put('/api/v1/links/:id', (req, res) => {
  logSection(`PUT /api/v1/links/${req.params.id}`);
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

app.delete('/api/v1/links/:id', (req, res) => {
  logSection(`DELETE /api/v1/links/${req.params.id}`);
  logAuth(req);
  const idx = links.findIndex((l) => l.id === Number(req.params.id));
  if (idx !== -1) links.splice(idx, 1);
  res.json({ response: { ok: true } });
});

app.get('/api/v1/search', (req, res) => {
  logSection('GET /api/v1/search');
  logAuth(req);
  const q = req.query.searchQueryString ?? '';
  console.log('Query:', { sort: req.query.sort, searchQueryString: q });

  const urlMatch = /^url:(.+)$/.exec(String(q));
  const targetUrl = urlMatch ? decodeURIComponent(urlMatch[1].trim()) : '';

  const matching = targetUrl
    ? links.filter((l) => l.body.url === targetUrl)
    : [];

  res.json({
    data: {
      links: matching.map((l) => ({
        id: l.id,
        url: l.body.url,
        name: l.body.name,
      })),
    },
  });
});

// Screenshot archive upload (after POST /links when "upload image" is enabled)
app.post('/api/v1/archives/:id', upload.single('file'), (req, res) => {
  logSection(`POST /api/v1/archives/${req.params.id}`);
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

app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

app.listen(PORT, () => {
  console.log(`Mock Linkwarden listening on http://localhost:${PORT}`);
  console.log('Point the extension base URL at that address (no trailing slash).');
});
