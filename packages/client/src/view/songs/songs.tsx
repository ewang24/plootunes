import React, { useContext, useEffect, useState } from 'react';
import { Button, Page } from '@ploot/pds';
import type { SongDTO } from '@ploot/plootunes-shared';
import { SongService } from '../../services/songService.ts';
import SongsGrid from '../global/widgets/songsGrid';
import { QueueService } from '../../services/queueService.ts';
import { PlayerContext } from '../main';

const SongsList = () => {
  const { queueSong, setCurrentlyPlayingSong, currentlyPlayingSong, setShuffled } = useContext(PlayerContext)!;
  const [songs, setSongs] = useState<SongDTO[] | undefined>();

  useEffect(() => {
    SongService.getSongs().then((songs: SongDTO[]) => setSongs(songs));
  }, []);

  function onPlayCallback(song: SongDTO) {
    QueueService.queueAllSongsAndPlay(song.id).then(() => {
      setCurrentlyPlayingSong(song);
      setShuffled(false);
    });
  }

  function shuffleAndPlayAllSongs() {
    QueueService.shuffleAllSongsAndPlay().then((firstInQueue: SongDTO | null) => {
      if (!firstInQueue) return;
      setCurrentlyPlayingSong(firstInQueue);
      setShuffled(true);
    });
  }

  return <Page
    title='All Songs'
    headerWidgets={<Button onClick={shuffleAndPlayAllSongs} icon='shuffle'>Shuffle All</Button>}
  >
    <SongsGrid songs={songs} displayAlbumInfo onPlay={onPlayCallback} onQueue={queueSong} />
  </Page>;
};

export default SongsList;
