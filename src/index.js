import { startServer } from './startServer.js';

const requestedPort = Number(process.env.PORT) || 3000;
const host = process.env.PUBLIC ? '0.0.0.0' : '127.0.0.1';
const hostString = process.env.PUBLIC ? 'your-ip-address' : 'localhost';
const { port } = await startServer(requestedPort, host);
console.log(`Linkling listening on http://${hostString}:${port}`);
