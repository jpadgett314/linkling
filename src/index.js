import { startServer } from './startServer.js';

const requestedPort = Number(process.env.PORT) || 3000;
const { port } = await startServer(requestedPort);
console.log(`Linkling listening on http://localhost:${port}`);
