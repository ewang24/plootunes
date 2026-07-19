import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { Button } from '@ploot/pds';
import { PlayerContext } from '../main';
import { AudioService } from '../../services/audioService.ts';
import { QueueService } from '../../services/queueService.ts';
import { PlaybackService } from '../../services/playbackService.ts';
import type { RepeatMode, SongDTO } from '@ploot/plootunes-shared';
import { StatService } from '../../services/statService.ts';
import { coverUrl } from '../../services/covers.ts';

const VOLUME_STORAGE_KEY = 'plootunes.volume';
const POSITION_HEARTBEAT_MS = 10_000;

function nextRepeatMode(current: RepeatMode): RepeatMode {
  if (current === 'off') return 'all';
  if (current === 'all') return 'one';
  return 'off';
}

function repeatTitle(mode: RepeatMode): string {
  if (mode === 'all') return 'Repeat All';
  if (mode === 'one') return 'Repeat One';
  return 'Repeat Off';
}

function Player() {
  const { shuffled, setShuffled, repeat, setRepeat, currentlyPlayingSong, setCurrentlyPlayingSong, resumePositionMs, consumeResume } = useContext(PlayerContext)!;
  const audioPlayer = useRef<HTMLAudioElement>(null);
  const pendingSeekRef = useRef<number | null>(null);

  const audioSrc = currentlyPlayingSong ? AudioService.streamUrl(currentlyPlayingSong.id) : undefined;

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
    const audio = audioPlayer.current;
    if (!audio) return;

    const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (storedVolume !== null) audio.volume = Number(storedVolume);

    function handleLoadedMetadata() {
      if (!audio || pendingSeekRef.current == null) return;
      audio.currentTime = pendingSeekRef.current / 1000;
      pendingSeekRef.current = null;
    }

    function reportPosition() {
      if (!audio) return;
      // Position sync is best-effort: last-write-wins and the next heartbeat retries,
      // so a failed persist is logged, never surfaced to the listener.
      PlaybackService.updatePlaybackState({ positionMs: Math.floor(audio.currentTime * 1000) }).catch(
        (err) => console.error('Failed to persist playback position', err),
      );
    }

    function handleVolumeChange() {
      if (!audio) return;
      localStorage.setItem(VOLUME_STORAGE_KEY, String(audio.volume));
    }

    const heartbeat = setInterval(() => {
      if (!audio.paused) reportPosition();
    }, POSITION_HEARTBEAT_MS);

    audio.addEventListener('ended', playNextSong);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('pause', reportPosition);
    audio.addEventListener('seeked', reportPosition);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      clearInterval(heartbeat);
      audio.removeEventListener('ended', playNextSong);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('pause', reportPosition);
      audio.removeEventListener('seeked', reportPosition);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }

  function processAudioSrc() {
    if (!audioSrc || !audioPlayer.current) return;
    if (resumePositionMs != null) {
      pendingSeekRef.current = resumePositionMs;
      consumeResume();
      return;
    }
    audioPlayer.current.play();
  }

  function processCurrentlyPlayingSong() {
    if (!currentlyPlayingSong) return;
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
        <div className='repeat-mode'>
          <Button
            icon='repeatCircle'
            variant={repeat !== 'off' ? 'primary' : 'ghost'}
            size='md'
            onClick={() => setRepeat(nextRepeatMode(repeat))}
            title={repeatTitle(repeat)}
          />
          {repeat === 'one' && <span className='repeat-mode__badge'>1</span>}
        </div>
        <Button
          icon='shuffle'
          variant={shuffled ? 'primary' : 'ghost'}
          size='md'
          onClick={() => setShuffled(!shuffled)}
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
