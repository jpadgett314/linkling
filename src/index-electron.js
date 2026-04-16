import { app } from 'electron';
import { LinklingApp } from './LinklingApp.js';
import { Library } from './features/library/Library.js';
import { ConfigurationRegistry } from './features/configuration/ConfigurationRegistry.js';
import { LinklingServer } from './LinklingServer.js';

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

async function init() {
  const registry = new ConfigurationRegistry();
  const library = new Library([]);
  const server = new LinklingServer(registry, library);
  const app = new LinklingApp(server, registry, library);

  await app.open();
  await registry.init();
  await library.init(registry.get('libraryDirectory'));
  await server.startLocal();
}

async function main() {
  if (app.isPackaged) {
    process.env.LINKLING_DATA_DIR = app.getPath('userData');
  }

  app.setLoginItemSettings({
    openAtLogin: true,
    enabled: true,
  });

  await init();
}

app.whenReady().then(main).catch((err) => {
  console.error(err);
  app.quit();
});
