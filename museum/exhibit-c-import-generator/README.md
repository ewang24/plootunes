# Exhibit C: The Import Generator

The static import generator for prod Electron builds.

In development, `injectAllHandlers()` dynamically imports all handler service files at runtime. But Electron's prod build (webpack) can't handle fully dynamic `import()` paths. `generateElectronServiceImports.js` solves this by scanning `handlerServices/` at build time and emitting `generatedHandlerImports.ts` — a static file with explicit imports that webpack can bundle.

## Files

- `generateElectronServiceImports.js` — the Node.js script (run during build) that scans and generates the import file
- `generatedHandlerImports.ts` — the generated output; checked in so the prod build always has a current snapshot

Originals remain in `scripts/` and `src/electron/services/handlers/decorators/` respectively until their port ticket removes them.
