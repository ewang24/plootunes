import { SongService } from "../songService";
const { contextBridge } = require('electron');

export function inject(){

    const songService: SongService = new SongService();

    contextBridge.exposeInMainWorld('songService', {
        songService: songService,
      });
}