import React, { createContext, useState } from 'react';
import '../styles/global.scss'
import '../styles/main.scss'
import AppRouter from './navigation/router';
import PlayerMain from './player/playerMain';
import type { SongDTO } from '@ploot/plootunes-shared';
import { SystemService } from './global/electronServices/systemService';
import { QueueService } from '../services/queueService.ts';

export interface PlayerContext {
  playSongNow(song: SongDTO): void;
  queueSong(song: SongDTO): void;
  currentlyPlayingSong: SongDTO | undefined;
  setCurrentlyPlayingSong: React.Dispatch<React.SetStateAction<SongDTO | undefined>>;
  shuffled: boolean;
  setShuffled: (shuffled: boolean) => void;
  repeat: boolean;
  setRepeat: (repeat: boolean) => void;
}

export const PlayerContext = createContext<PlayerContext | undefined>(undefined);

const Main = () => {
  const [shuffled, setShuffled] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [currentlyPlayingSong, setCurrentlyPlayingSong] = useState<SongDTO | undefined>(undefined);

  function playSongNow(song: SongDTO) {
    setCurrentlyPlayingSong(song);
    QueueService.playSong(song.id).catch((err) => {
      window.alert(`Error: ${JSON.stringify(err)}`);
    });
  }

  function queueSong(song: SongDTO) {
    QueueService.queueSong(song.id).then(() => {
      if (currentlyPlayingSong) return;
      setCurrentlyPlayingSong(song);
    });
  }

  function handleShuffledChange(shuffled: boolean) {
    SystemService.setShuffled(shuffled).then(() => setShuffled(shuffled));
  }

  function handleRepeatChange(repeat: boolean) {
    SystemService.setRepeat(repeat).then(() => setRepeat(repeat));
  }

  return (
    <div className='main-container'>
      <PlayerContext.Provider value={{ playSongNow, queueSong, currentlyPlayingSong, setCurrentlyPlayingSong, shuffled, setShuffled: handleShuffledChange, repeat, setRepeat: handleRepeatChange }}>
        <AppRouter />
        <PlayerMain />
      </PlayerContext.Provider>
    </div>
  );
};

export default Main;
