import { ElectronUtil } from "../../util/electronUtil";

export class AudioService{
    static async getSongBuffer(songId: number): Promise<Buffer>{
        return ElectronUtil.invoke<Buffer>('getSongBuffer', songId);
    }
}