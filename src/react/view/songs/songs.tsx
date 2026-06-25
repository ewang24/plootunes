import React, { useContext, useEffect, useState } from 'react';
import { Button, Page } from '@ploot/pds';
import { Song } from '../../../core/db/dbEntities/song';
import { SongService } from './electronServices/songService';
import SongsGrid from '../global/widgets/songsGrid';
import { QueueService } from '../albums/electronServices/queueService';
import { PlayerContext } from '../main';

const SongsList = () => {
  const { queueSong, setCurrentlyPlayingSong, currentlyPlayingSong, setShuffled } = useContext(PlayerContext);
  const [songs, setSongs] = useState<Song[] | undefined>();

  useEffect(() => {
    SongService.getSongs(true).then((songs: Song[]) => setSongs(songs));
  }, []);

  function onPlayCallback(song: Song) {
    QueueService.queueAllSongsAndPlay(song.id).then(() => {
      setCurrentlyPlayingSong(song);
      setShuffled(false);
    });
  }

  function shuffleAndPlayAllSongs() {
    QueueService.shuffleAllSongsAndPlay().then((firstInQueue: Song) => {
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
