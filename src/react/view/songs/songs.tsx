import React, { useEffect, useState } from 'react';
import { Song } from '../../../core/db/dbEntities/song';
import { SongService } from './electronServices/songService';
import SongsGrid from '../global/widgets/songsGrid';
import ViewContainer from '../global/viewContainer';
import Header from '../global/widgets/header';

const SongsList = () => {
  const [songs, setSongs] = useState<Song[] | undefined>();

  useEffect(() => {
    SongService.getSongs(true).then((songs: Song[]) => {
      console.log(songs);
      setSongs(songs);
    })
  }, []);

  function onPlayCallback(song: Song) {

  }

  function onQueueCallback(song: Song) {

  }

  return <ViewContainer
    header={<Header label='All Songs'/>}
    content={<SongsGrid songs={songs} displayAlbumInfo = {true} onPlay={onPlayCallback} onQueue={onQueueCallback} />}
  />
};

export default SongsList;
