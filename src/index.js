import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { CollectionDirectory } from './CollectionDirectory.js';

const PORT = Number(process.env.PORT) || 3000;
const app = express();

const upload = multer({ storage: multer.memoryStorage() });

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(projectRoot, 'config.json');
const rawConfig = await fs.readFile(configPath, 'utf8');
const parsedConfig = JSON.parse(rawConfig);
const collectionsDir = path.resolve(projectRoot, parsedConfig.collectionDirectory ?? './collections');
const collections = new CollectionDirectory(collectionsDir);
await collections.initialize();

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
  const metadata = collections.getAllMetadata();
  res.json({
    response: metadata.map((m) => ({
      id: m.id,
      name: m.name,
      color: '#6366f1',
      createdAt: now,
      description: '',
      isPublic: false,
      members: [],
      ownerId: 1,
      parent: null,
      parentId: null,
      updatedAt: now,
    })),
  });
});

app.get('/api/v1/tags', (req, res) => {
  logSection('GET /api/v1/tags');
  logAuth(req);
  const now = new Date().toISOString();
  const tags = collections.getAllTags();
  res.json({
    response: tags.map((name, idx) => ({
      id: idx + 1,
      name,
      ownerId: 1,
      createdAt: now,
      updatedAt: now,
      _count: { links: 0 },
    })),
  });
});

// --- Links CRUD + search (extension core) ---

app.post('/api/v1/links', async (req, res) => {
  logSection('POST /api/v1/links (save bookmark)');
  logAuth(req);
  console.log('Bookmark payload:', JSON.stringify(req.body, null, 2));
  try {
    const collectionId = Number(req.body?.collection?.id ?? 1);
    const rawTags = Array.isArray(req.body.tags) ? req.body.tags : [];
    const tags = rawTags
      .map((t) => (typeof t === 'string' ? t : t?.name))
      .filter((t) => typeof t === 'string' && t.trim().length > 0);

    await collections.saveBookmark({
      collectionId,
      name: req.body.name,
      url: req.body.url,
      description: req.body.description ?? '',
      tags,
    });

    const stored = {
      id: Date.now(),
      collectionId,
      url: req.body.url,
      name: req.body.name,
      description: req.body.description ?? '',
      collection: req.body.collection ?? { id: collectionId },
      tags: rawTags,
      image: req.body.image,
    };

    res.status(201).json({ response: stored });
  } catch (err) {
    console.error('Error saving bookmark:', err);
    if (err instanceof Error && err.message.startsWith('Unknown collection id')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to save bookmark' });
    }
  }
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

  const results = targetUrl ? collections.searchByUrl(targetUrl) : [];

  res.json({
    data: {
      links: results.map((r, idx) => ({
        id: idx + 1,
        url: r.url,
        name: r.name,
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
