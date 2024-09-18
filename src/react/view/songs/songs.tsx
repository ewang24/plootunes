import React, { useEffect, useState } from 'react';
import { Song } from '../../../core/db/dbEntities/song';
import { SongService } from './electronServices/songService';
import SongsGrid from '../global/widgets/songsGrid';

const SongsList = () => {
  const [songs, setSongs] = useState<Song[] | undefined>();

  useEffect(() => {
    SongService.getSongs().then((songs: Song[]) => {
      setSongs(songs);
    })
  }, []);

  function onPlayCallback(song: Song){

  }

  function onQueueCallback(song: Song){

  }

  return <SongsGrid songs={songs} onPlay={onPlayCallback} onQueue={onQueueCallback}/>
};

export default SongsList;
