import React, { createContext, useState } from 'react';
import '../styles/global.scss'
import '../styles/main.scss'
import AppRouter from './navigation/router';
import PlayerMain from './player/playerMain';
import { ElectronUtil } from './util/electronUtil';

export interface PlayerContext {
  playSongNow(songId: number): void;
  queueSong(songId): void;
  currentlyPlayingSong: number | undefined;
}

export const PlayerContext = createContext<PlayerContext | undefined>(undefined);

const Main = () => {

  const [currentlyPlayingSong, setCurrentlyPlayingSong] = useState<number | undefined>(undefined);


  function playSongNow(songId: number){
    debugger;
    ElectronUtil.invoke('queueSong', songId).then(() => {
      debugger;
      setCurrentlyPlayingSong(songId);
    });
  }

  function queueSong(songId: number){
    ElectronUtil.invoke('queueSong', songId).then(() => {
      if(currentlyPlayingSong){
        return;
      }

      setCurrentlyPlayingSong(songId);
    });
  }

  return <div className='main-container'>
    <PlayerContext.Provider value={{playSongNow, queueSong, currentlyPlayingSong}}>
      <>
        <AppRouter />
        <PlayerMain />
      </>
    </PlayerContext.Provider>
  </div>
};

export default Main;
