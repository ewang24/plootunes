import { ElectronUtil } from "../../util/electronUtil";

export class StatService{
    static async addSongPlay(songId: number): Promise<void>{
        ElectronUtil.invoke("addSongPlay", songId);   
    }
}