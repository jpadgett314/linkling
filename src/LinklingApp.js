import path from 'node:path';
import { app, Tray, Menu, nativeImage, dialog } from 'electron';
import { ConfigurationRegistry } from './features/configuration/ConfigurationRegistry.js';
import { LinklingServer } from './LinklingServer.js';
import { importBookmarks } from './features/migration/firefox/importBookmarks.js';
import { Library } from './features/library/Library.js';

class LinklingApp {
  /**
   * @param {LinklingServer} server
   * @param {ConfigurationRegistry} registry
   */
  constructor(server, registry, library) {
    /** @type {LinklingServer} */
    this._server = server;
    /** @type {ConfigurationRegistry} */
    this._registry = registry;
    /** @type {Library} */
    this._library = library;
  }

  async open() {
    const menu = buildMenu(this, this._registry, this._library);
    const tray = buildTray(menu);
    app.on('before-quit', () => {
      tray?.destroy();
    });
  }

  async quit() {
    if (this._server) {
      await this._server.stop();
      app.quit();
    } else {
      app.quit();
    }
  }
}

/**
 * Open native file chooser dialog via Electron
 * @param {object} options
 * @param {async (p: string) => void} options.action
 * @param {'open' | 'save'} [options.type]
 */
async function fileDialog(options) {
  const {action, type, ...other} = options;

  let result;
  if (type == 'save') {
    result = await dialog.showSaveDialog(other);
  } else {
    result = await dialog.showOpenDialog(other);
  }

  if (!result.canceled && result.filePaths.length > 0) {
    await action(result.filePaths[0]);
  }
}

/**
 * Build Electron context menu (for tray icon)
 * @param {LinklingApp} linkling
 * @param {ConfigurationRegistry} registry
 * @param {Library} library
 * @returns {Menu}
 */
function buildMenu(linkling, registry, library) {
  return Menu.buildFromTemplate([
    {
      label: 'Select Library Folder',
      click: async () => fileDialog({
        title: 'Select Bookmark Library Folder',
        properties: ['openDirectory'],
        action: async (selected) => {
          registry.set('libraryDirectory', selected);
          await library.init(selected);
        }
      }),
    },
    {
      label: 'Import Firefox Backup',
      click: async () => fileDialog({
        title: 'Select Firefox bookmark backup JSON file',
        properties: ['openFile'],
        action: async (selected) => {
          await importBookmarks(selected, registry),
          dialog.showMessageBox({
            type: 'info',
            title: 'Import Complete',
            message: 'bookmark import complete',
            buttons: ['OK'],
          });
        }
      }),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: async () => linkling.quit(),
    },
  ]);
}

/**
 * Build Electron taskbar tray
 * @param {Menu} menu
 * @returns {Tray}
 */
function buildTray(menu) {
  const iconPath = path.join(app.getAppPath(), 'assets', 'icon-512.png');
  const icon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(icon);
  tray.setToolTip('Linkling');
  tray.setContextMenu(menu);
  return tray;
}

export { LinklingApp };
