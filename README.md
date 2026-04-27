# Linkling

Do you dislike cloud-based bookmark services, but don't want to self-host? Then consider Linkling bookmark server, which stores bookmarks in simple JSON files.

Linkling aims to implement the Linkding and Linkwarden APIs for compatiblity with those ecosystems.

Currently, Linkling is compatible with the following projects:
- [Official Linkwarden Browser Extension](https://github.com/linkwarden/browser-extension)
- [Linka!](https://github.com/linka-app/linka) (linkding web client)

One goal of this project is to support [Floccus](https://floccus.org/), the Syncthing of the bookmark world, by leveraging the current Linkwarden integration.

## Installation

Installers are available for Windows and Linux via Flatpak (see Releases). Linkling is a headless server, so do not expect a GUI. However, there is a tray icon with a context menu.

By default, the Flatpak can't access external collections due to Flatpak sandboxing. Use [Flatseal](https://flathub.org/en/apps/com.github.tchx84.Flatseal) to grant the Flatpak access to an external directory.

## FAQ

***Is this suitable for multiple users?***

Linkling isn't suitable for sharing bookmarks, no. If you're going to self-host, use a fully-fledged bookmark server.

You can sync the JSON bookmark collections using a cloud storage provider, but merge conflicts are likely if two users simultaneously modify the database.

> [!WARNING]
> As of version 0.1.0, Linkling does not detect external changes while running.

## Development

Node 22+ required.

### Install Dependencies

```bash
npm install
```

### Start Server

```bash
npm start         # server only
npm electron:dev  # server with Electron tray + menu
```

### Package for Windows, Flatpak

```
npm run dist:nsis
npm run dist:flatpak
```

## Testing

Benchmark test uses [Grafana k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).

Performance is mainly bottlenecked by the filesystem.

For the server itself, >10k bookmarks per collection is no issue in practice. Clients may have their own problems with collections this large.

## Attribution

The icons located in `/assets` are sourced from the Twemoji project. Copyright 2019 Twitter, Inc and other contributors. These graphics are licensed under CC-BY 4.0.
