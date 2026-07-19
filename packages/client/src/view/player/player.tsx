import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@ploot/pds';
import { PlayerContext } from '../main';
import { AudioService } from '../albums/electronServices/audioService';
import { QueueService } from '../../services/queueService.ts';
import type { SongDTO } from '@ploot/plootunes-shared';
import { SystemService } from '../global/electronServices/systemService';
import { StatService } from '../../services/statService.ts';
import { coverUrl } from '../../services/covers.ts';

function Player() {
  const { shuffled, setShuffled, repeat, setRepeat, currentlyPlayingSong, setCurrentlyPlayingSong } = useContext(PlayerContext)!;
  const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
  const audioPlayer = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    SystemService.isShuffled().then((shuffled: boolean) => setShuffled(shuffled));
  }, []);

  useLayoutEffect(() => setUpAudioPlayerListeners(), [audioSrc]);

  useLayoutEffect(() => { processAudioSrc(); }, [audioSrc]);

  useEffect(() => {
    processCurrentlyPlayingSong();
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.metadata = null;
      }
    };
  }, [currentlyPlayingSong]);

  function setUpAudioPlayerListeners() {
    if (!audioPlayer.current) return;
    audioPlayer.current.addEventListener("ended", playNextSong);
    return () => {
      if (!audioPlayer?.current) return;
      audioPlayer.current.removeEventListener("ended", playNextSong);
    };
  }

  function processAudioSrc() {
    if (!audioSrc) return;
    if (!audioPlayer.current) {
      window.alert("Fatal error! Audio player not available. Please restart the application.");
      return;
    }
    audioPlayer.current.play();
  }

  function processCurrentlyPlayingSong() {
    if (!currentlyPlayingSong) return;
    // AudioService is still on the dormant Electron IPC path (see electronUtil.ts), which
    // predates the string-UUID song ids used everywhere else in the browser build.
    AudioService.getSongBuffer(currentlyPlayingSong.id as unknown as number).then((data: Buffer) => {
      processAudioBuffer(data);
      if ('mediaSession' in navigator) {
        const artwork = [];
        if (currentlyPlayingSong.coverImage) {
          artwork.push({ src: coverUrl(currentlyPlayingSong.coverImage), sizes: '128x128', type: 'image/jpeg' });
        }
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentlyPlayingSong.name ?? undefined,
          artist: currentlyPlayingSong.artistName || 'Unknown Artist',
          album: currentlyPlayingSong.albumName || 'Unknown Album',
          artwork,
        });
        navigator.mediaSession.setActionHandler('play', () => {});
        navigator.mediaSession.setActionHandler('pause', () => {});
        navigator.mediaSession.setActionHandler('previoustrack', () => {});
        navigator.mediaSession.setActionHandler('nexttrack', () => {});
      }
    });
  }

  function processAudioBuffer(data: Buffer) {
    const blob = new Blob([data], { type: 'audio/mpeg' });
    setAudioSrc(URL.createObjectURL(blob));
  }

  async function playPreviousSong() {
    const previousSongInQueue: SongDTO | null = await QueueService.getPreviousSongInQueue();
    if (!previousSongInQueue) return;
    QueueService.transitionCurrentSong(previousSongInQueue.id)
      .then(() => setCurrentlyPlayingSong(previousSongInQueue))
      .catch((err) => window.alert(`Fatal error: ${JSON.stringify(err, null, 2)}`));
  }

  async function playNextSong() {
    if (!currentlyPlayingSong) return;
    const [nextSongInQueue]: [SongDTO | null, void] = await Promise.all([QueueService.getNextSongInQueue(), StatService.addSongPlay(currentlyPlayingSong.id)]);
    if (!nextSongInQueue) return;
    QueueService.transitionCurrentSong(nextSongInQueue.id)
      .then(() => setCurrentlyPlayingSong(nextSongInQueue))
      .catch((err) => window.alert(`Fatal error: ${JSON.stringify(err, null, 2)}`));
  }

  return <div className='player-controls'>
    {audioSrc &&
      <div className='p-row player-controls-row'>
        <Button
          icon='rewind'
          variant='ghost'
          size='md'
          onClick={playPreviousSong}
          title='Previous Song'
        />
        <Button
          icon='repeatCircle'
          variant={repeat ? 'primary' : 'ghost'}
          size='md'
          onClick={() => setRepeat(!repeat)}
          title='Repeat'
        />
        <Button
          icon='shuffle'
          variant={shuffled ? 'primary' : 'ghost'}
          size='md'
          onClick={() => {
            if (!shuffled) QueueService.shuffleCurrentQueue();
            setShuffled(!shuffled);
          }}
          title='Shuffle'
        />
        <strong>{currentlyPlayingSong?.name}</strong>
        <audio ref={audioPlayer} key={audioSrc} controls>
          <source src={audioSrc} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <Button
          icon='fastForward'
          variant='ghost'
          size='md'
          onClick={playNextSong}
          title='Next Song'
        />
      </div>
    }
  </div>;
}

export default Player;
