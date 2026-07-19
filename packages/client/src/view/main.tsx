import React, { createContext, useEffect, useState } from 'react';
import '../styles/global.scss'
import '../styles/main.scss'
import AppRouter from './navigation/router';
import PlayerMain from './player/playerMain';
import type { RepeatMode, SongDTO } from '@ploot/plootunes-shared';
import { QueueService } from '../services/queueService.ts';
import { PlaybackService } from '../services/playbackService.ts';

export interface PlayerContext {
  playSongNow(song: SongDTO): void;
  queueSong(song: SongDTO): void;
  currentlyPlayingSong: SongDTO | undefined;
  setCurrentlyPlayingSong: React.Dispatch<React.SetStateAction<SongDTO | undefined>>;
  shuffled: boolean;
  setShuffled: (shuffled: boolean) => void;
  repeat: RepeatMode;
  setRepeat: (repeat: RepeatMode) => void;
  resumePositionMs: number | null;
  consumeResume(): void;
}

export const PlayerContext = createContext<PlayerContext | undefined>(undefined);

const Main = () => {
  const [shuffled, setShuffled] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [currentlyPlayingSong, setCurrentlyPlayingSong] = useState<SongDTO | undefined>(undefined);
  const [resumePositionMs, setResumePositionMs] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([PlaybackService.getPlaybackState(), QueueService.getAllQueuedSongs()]).then(([state, queue]) => {
      setCurrentlyPlayingSong(queue.currentlyPlaying ?? undefined);
      setShuffled(state.shuffled);
      setRepeat(state.repeat);
      setResumePositionMs(state.positionMs);
    });
  }, []);

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
    PlaybackService.updatePlaybackState({ shuffled }).then(() => setShuffled(shuffled));
  }

  function handleRepeatChange(repeat: RepeatMode) {
    PlaybackService.updatePlaybackState({ repeat }).then(() => setRepeat(repeat));
  }

  function consumeResume() {
    setResumePositionMs(null);
  }

  return (
    <div className='main-container'>
      <PlayerContext.Provider value={{ playSongNow, queueSong, currentlyPlayingSong, setCurrentlyPlayingSong, shuffled, setShuffled: handleShuffledChange, repeat, setRepeat: handleRepeatChange, resumePositionMs, consumeResume }}>
        <AppRouter />
        <PlayerMain />
      </PlayerContext.Provider>
    </div>
  );
};

export default Main;
