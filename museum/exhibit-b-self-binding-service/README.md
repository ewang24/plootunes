# Exhibit B: The Self-Binding Service

`BaseHandlerService` and its `this`-rebinding magic.

Because decorators run at the class level (not the instance level), a method decorated with `@handler` that calls `this.someHelper()` would lose its `this` context when invoked by `ipcMain`. `BaseHandlerService` solves this by binding every decorated method to the current instance in its constructor, so subclasses never have to think about it.

In the author's own words:

> *"TBH this pattern might not be a great idea, but it was fun to do and it's cool so I'm keeping it >:)"*

## Files

- `baseHandlerService.ts` — the base class all handler services inherit from

Original remains in `src/electron/services/handlers/baseHandlerService.ts` until its port ticket removes it.
