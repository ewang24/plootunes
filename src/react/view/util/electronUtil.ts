export class ElectronUtil{

    static async invoke<T>(handlerPath: string): Promise<T>{
        return (window as any).electron.ipcRenderer.invoke(handlerPath) as T;
    }

}