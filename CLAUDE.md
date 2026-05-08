# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (root + electron + react)
npm run install:all

# Run desktop app (run both in separate terminals)
npm run react        # Vite dev server on port 3000
npm run electron     # Electron process (expects React on :3000)

# Tests
npm test                          # all tests
npx jest path/to/test.spec.ts     # single test file

# Mobile app (requires Android emulator running)
cd src/mobile && npm run start    # deploy to emulator

# Mobile native rebuild (only needed when adding native libs)
npm run deployDevLocal            # requires WSL on Windows
```

Note: Node 20 required — later versions break the `sqlite3` native build.

## Architecture

This is a TypeScript monorepo with three layers:

**`src/core/`** — shared between desktop and mobile. Contains the SQLite schema (`.sql` files), DTO classes (query wrappers), and DB entity types. Both platforms implement the `Connector` interface and share the same queries.

**`src/electron/`** — Electron main process + React renderer. Has its own `package.json`. The main process communicates with the renderer via Electron IPC. Services are registered using two decorators:
- `@handlerFactory` on a factory class → registers the factory
- `@handler` on a service method → exposes that method as an `ipcMain` handler

`injectAllHandlers()` in `handler-util.ts` wires everything up at startup. In dev mode it dynamically imports all files under `handlerServices/` so you don't need to manually register new services — just decorate them. In prod the generated `generatedHandlerImports.ts` (via `scripts/generateElectronServiceImports.js`) provides static imports for the build.

**`src/react/`** — Vite + React renderer. Has its own `package.json`. Builds into `src/electron/dist/front_end/`. Services in `src/react/view/**/electronServices/` call the main process via `window.electron` (preload bridge).

**`src/mobile/`** — React Native (Expo) app. Uses `expoSqliteConnector` to implement the shared `Connector` interface against Expo SQLite.

## Vikunja

Project: **PlooTunes** (ID: 6). Use the `plootocol` MCP tools to read and write tickets — `vikunja_list_tasks` with `project_id: 6`, `vikunja_create_task` for new work, `vikunja_update_task` to close or update.
