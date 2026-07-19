import { ElectronUtil } from "../../util/electronUtil";

export class SystemService{

    static async isShuffled(): Promise<boolean>{
        return ElectronUtil.invoke<boolean>("isShuffled");
    }

    static async setShuffled(shuffled: boolean): Promise<void>{
        return ElectronUtil.invoke<void>("setShuffled", shuffled);
    }

    static async setRepeat(shuffled: boolean): Promise<void>{
        return ElectronUtil.invoke<void>("setRepeat", shuffled);
    }
}