# The PlooTunes Museum

This directory preserves retired-but-beloved machinery from the Electron era of PlooTunes. These pieces are not part of the new web-app build — they exist here so their clever ideas are not lost when the Electron source is eventually removed.

The museum is excluded from the build, linting, and formatting passes (see `.prettierignore` and `eslint.config.mjs`). Originals may still live in `src/` until their port ticket removes them.

## Exhibits

- [Exhibit A: The Decorator Engine](exhibit-a-decorator-engine/README.md) — `@handler`/`@handlerFactory` + `injectAllHandlers()` dynamic-import wiring
- [Exhibit B: The Self-Binding Service](exhibit-b-self-binding-service/README.md) — `BaseHandlerService` and its `this`-rebinding magic
- [Exhibit C: The Import Generator](exhibit-c-import-generator/README.md) — build-time static import generator for prod Electron builds
