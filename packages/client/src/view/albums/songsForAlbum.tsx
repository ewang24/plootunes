import React, { useContext, useEffect, useState } from 'react';
import { Button, Page } from '@ploot/pds';
import type { AlbumDTO, SongDTO } from '@ploot/plootunes-shared';
import { PlayerContext } from '../main';
import { QueueService } from '../../services/queueService.ts';
import { SongService } from '../../services/songService.ts';
import SongsGrid from '../global/widgets/songsGrid';

export interface SongsForAlbumProps {
  album: AlbumDTO;
  closeSongsForAlbumView: () => void;
}

function SongsForAlbum({ album, closeSongsForAlbumView }: SongsForAlbumProps) {
  const { playSongNow, setShuffled, queueSong, setCurrentlyPlayingSong, currentlyPlayingSong } = useContext(PlayerContext)!;
  const [songs, setSongs] = useState<SongDTO[] | undefined>(undefined);

  useEffect(() => {
    SongService.getSongsByAlbum(album.id).then((songs: SongDTO[]) => setSongs(songs));
  }, []);

  function playAlbumCallback() {
    QueueService.playAlbum(album.id).then(() => {
      setCurrentlyPlayingSong(songs?.[0]);
      setShuffled(false);
    });
  }

  function queueAlbumCallback() {
    QueueService.queueAlbum(album.id).then(() => {
      if (currentlyPlayingSong) setCurrentlyPlayingSong(songs?.[0]);
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
