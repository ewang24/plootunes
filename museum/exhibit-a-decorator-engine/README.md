# Exhibit A: The Decorator Engine

The `@handler` / `@handlerFactory` decorator system combined with `injectAllHandlers()` dynamic-import wiring.

In the Electron era, services exposed their methods as `ipcMain` handlers by decorating them with `@handler` on the method and `@handlerFactory` on the factory class. At startup, `injectAllHandlers()` dynamically imported every file under `handlerServices/` (dev mode) or used the pre-generated static import list (prod) to auto-register all handlers — no manual wiring required.

## Files

- `handler-util.ts` — `injectAllHandlers()` entry point; dynamic import loop in dev, static imports in prod
- `handlerDecorator.ts` — `@handler` method decorator; registers the method name for later binding
- `handlerFactoryDecorator.ts` — `@handlerFactory` class decorator; wires the factory into `ipcMain`
- `handlers.ts` — shared registry used by both decorators at runtime

Originals remain in `src/electron/services/handlers/decorators/` until their port ticket removes them.
