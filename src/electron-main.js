import { app, Tray, Menu, nativeImage, dialog } from 'electron';
import path from 'node:path';

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

/** @type {import('node:http').Server | null} */
let httpServer = null;
/** @type {number | null} */
let httpPort = null;
/** @type {Tray | null} */
let tray = null;

async function startServerWrapper() {
  const { startServer } = await import('./startServer.js');
  const requestedPort = Number(process.env.PORT) || 3000;
  const { server, port } = await startServer(requestedPort);
  httpServer = server;
  httpPort = port;
}

function trayIcon() {
  const iconPath = path.join(app.getAppPath(), 'assets', 'icon-256.ico');
  return nativeImage.createFromPath(iconPath);
}

function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Select Library Folder',
      click: async () => {
        const result = await dialog.showOpenDialog({
          title: 'Select Bookmark Library Folder',
          properties: ['openDirectory'],
        });

        if (result.canceled || result.filePaths.length === 0) {
          return;
        }

        const selectedPath = result.filePaths[0];

        console.log('Selected path:', selectedPath);

        await fetch(`http://localhost:${httpPort}/config`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            libraryDirectory: selectedPath,
          }),
        });

        await new Promise(resolve => {
          httpServer.close(() => {
            startServerWrapper().then(() => resolve())
          });
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        if (httpServer) {
          httpServer.close(() => app.quit());
        } else {
          app.quit();
        }
      }
    },
  ]);
}

async function main() {
  if (app.isPackaged) {
    process.env.LINKLING_DATA_DIR = app.getPath('userData');
  }

  app.setLoginItemSettings({
    openAtLogin: true,
    enabled: true,
  });

  await startServerWrapper();

  tray = new Tray(trayIcon());
  tray.setToolTip('Linkling');
  tray.setContextMenu(buildMenu());
}

app.whenReady().then(main).catch((err) => {
  console.error(err);
  app.quit();
});

app.on('before-quit', () => {
  tray?.destroy();
  tray = null;
});
