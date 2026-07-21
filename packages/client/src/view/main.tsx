import React, { createContext, useEffect, useState } from 'react';
import { useToast } from '@ploot/pds';
import 'react-virtualized/styles.css'
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
  showErrorToast(message: string): void;
}

export const PlayerContext = createContext<PlayerContext | undefined>(undefined);

const Main = () => {
  const { show, Toast } = useToast();
  const [shuffled, setShuffled] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [currentlyPlayingSong, setCurrentlyPlayingSong] = useState<SongDTO | undefined>(undefined);
  const [resumePositionMs, setResumePositionMs] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([PlaybackService.getPlaybackState(), QueueService.getCurrentSong()]).then(([state, currentSong]) => {
      setCurrentlyPlayingSong(currentSong ?? undefined);
      setShuffled(state.shuffled);
      setRepeat(state.repeat);
      setResumePositionMs(state.positionMs);
    });
  }, []);

  function showErrorToast(message: string) {
    show(message, { variant: 'error' });
  }

  function playSongNow(song: SongDTO) {
    setCurrentlyPlayingSong(song);
    QueueService.playSong(song.id).catch((err) => {
      console.error('Failed to play song', err);
      showErrorToast('Playback failed. Please try again.');
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
      <PlayerContext.Provider value={{ playSongNow, queueSong, currentlyPlayingSong, setCurrentlyPlayingSong, shuffled, setShuffled: handleShuffledChange, repeat, setRepeat: handleRepeatChange, resumePositionMs, consumeResume, showErrorToast }}>
        <AppRouter />
        <PlayerMain />
      </PlayerContext.Provider>
      <Toast />
    </div>
  );
};

export default Main;
