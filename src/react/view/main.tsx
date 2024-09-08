import React, { createContext, useState } from 'react';
import '../styles/global.scss'
import '../styles/main.scss'
import AppRouter from './navigation/router';
import PlayerMain from './player/playerMain';
import { ElectronUtil } from './util/electronUtil';

export interface PlayerContext {
  queueSong(songId): void;
  isPlaying: boolean;
}

export const PlayerContext = createContext<PlayerContext | undefined>(undefined);

const Main = () => {

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  function queueSong(songId){
    ElectronUtil.invoke('queueSong', songId).then(() => {
      setIsPlaying(true);
    });
  }

  return <div className='main-container'>
    <PlayerContext.Provider value={{queueSong, isPlaying}}>
      <>
        <AppRouter />
        <PlayerMain />
      </>
    </PlayerContext.Provider>
  </div>
};

export default Main;
