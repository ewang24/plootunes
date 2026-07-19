import React, { useContext, useEffect, useState } from 'react';
import { Button, Page } from '@ploot/pds';
import { Song } from '../../../core/db/dbEntities/song';
import { PlayerContext } from '../main';
import { QueueService } from './electronServices/queueService';
import { SongService } from '../songs/electronServices/songService';
import SongsGrid from '../global/widgets/songsGrid';

function SongsForAlbum({ album, closeSongsForAlbumView }) {
  const { playSongNow, setShuffled, queueSong, setCurrentlyPlayingSong, currentlyPlayingSong } = useContext(PlayerContext);
  const [songs, setSongs] = useState<Song[]>(undefined);

  useEffect(() => {
    SongService.getSongsByAlbum(album.id).then((songs: Song[]) => setSongs(songs));
  }, []);

  function playAlbumCallback() {
    QueueService.playAlbum(album.id).then(() => {
      setCurrentlyPlayingSong(songs[0]);
      setShuffled(false);
    });
  }

  function queueAlbumCallback() {
    QueueService.queueAlbum(album.id).then(() => {
      if (currentlyPlayingSong) setCurrentlyPlayingSong(songs[0]);
    });
  }

  return <Page
    title={album.name}
    subTitle={album.artistName}
    headerWidgets={<>
      <Button onClick={playAlbumCallback}>Play Album</Button>
      <Button onClick={queueAlbumCallback} variant='secondary'>Queue Album</Button>
      <Button icon='arrowLeft' variant='ghost' onClick={closeSongsForAlbumView} title='Back' />
    </>}
  >
    <SongsGrid
      songs={songs}
      onPlay={(song) => { setShuffled(false); playSongNow(song); }}
      onQueue={queueSong}
    />
  </Page>;
}

export default SongsForAlbum;
