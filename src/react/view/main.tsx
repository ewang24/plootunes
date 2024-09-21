import React, { createContext, useState } from 'react';
import '../styles/global.scss'
import '../styles/main.scss'
import AppRouter from './navigation/router';
import PlayerMain from './player/playerMain';
import { ElectronUtil } from './util/electronUtil';
import { Song } from '../../core/db/dbEntities/song';
import { SystemService } from './global/electronServices/systemService';

export interface PlayerContext {
  playSongNow(song: Song): void;
  queueSong(songId): void;
  currentlyPlayingSong: Song | undefined;
  setCurrentlyPlayingSong: React.Dispatch<React.SetStateAction<Song>>;
  shuffled: boolean;
  setShuffled: (shuffled: boolean) => void;
}

export const PlayerContext = createContext<PlayerContext | undefined>(undefined);

const Main = () => {

  
  const [shuffled, setShuffled] = useState<boolean>(false);
  const [currentlyPlayingSong, setCurrentlyPlayingSong] = useState<Song | undefined>(undefined);


  function playSongNow(song: Song){
    setCurrentlyPlayingSong(song);
    ElectronUtil.invoke('playSong', song.id).catch((err) => {
      window.alert(`Error: ${JSON.stringify(err)}`);
    });
  }

  function queueSong(song: Song){
    ElectronUtil.invoke('queueSong', song.id).then(() => {
      if(currentlyPlayingSong){
        return;
      }

      setCurrentlyPlayingSong(song);
    });
  }

  function handleShuffledChange(shuffled: boolean){
    SystemService
  }

  return <div className='main-container'>
    <PlayerContext.Provider value={{playSongNow, queueSong, currentlyPlayingSong, setCurrentlyPlayingSong, shuffled, setShuffled: handleShuffledChange}}>
      <>
        <AppRouter />
        <PlayerMain />
      </>
    </PlayerContext.Provider>
  </div>
};

export default Main;
