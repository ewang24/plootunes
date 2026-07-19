export class ElectronUtil{

    static async invoke<T>(handlerPath: string, ...params: Object[]): Promise<T>{
        return (window as any).electron.ipcRenderer.invoke(handlerPath, ...params) as T;
    }

}