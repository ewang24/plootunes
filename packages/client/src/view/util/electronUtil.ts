export class ElectronUtil{

    // The audio player and shuffle/repeat controls still call out to Electron's IPC bridge,
    // which is absent in a browser tab. Resolving to undefined here keeps those calls inert
    // instead of throwing, so the browser build doesn't dirty the console with rejections
    // for functionality that has no browser-side implementation yet.
    static async invoke<T>(handlerPath: string, ...params: unknown[]): Promise<T>{
        const ipcRenderer = (window as any).electron?.ipcRenderer;
        if (!ipcRenderer) return undefined as T;
        return ipcRenderer.invoke(handlerPath, ...params) as T;
    }

}