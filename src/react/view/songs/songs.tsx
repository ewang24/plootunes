import React, { useContext, useEffect, useState } from 'react';
import { Song } from '../../../core/db/dbEntities/song';
import { SongService } from './electronServices/songService';
import SongsGrid from '../global/widgets/songsGrid';
import ViewContainer from '../global/viewContainer';
import Header from '../global/widgets/header';
import { QueueService } from '../albums/electronServices/queueService';
import { PlayerContext } from '../main';

const SongsList = () => {

  const { queueSong, setCurrentlyPlayingSong, currentlyPlayingSong } = useContext(PlayerContext);
  const [songs, setSongs] = useState<Song[] | undefined>();

  useEffect(() => {
    SongService.getSongs(true).then((songs: Song[]) => {
      console.log(songs);
      setSongs(songs);
    })
  }, []);

  function onPlayCallback(song: Song) {
    QueueService.queueAllSongsAndPlay(song.id).then(() => {
      setCurrentlyPlayingSong(song);
    });
  }

  function onQueueCallback(song: Song) {
    queueSong(song);
  }

  return <ViewContainer
    header={<Header label='All Songs'/>}
    content={<SongsGrid songs={songs} displayAlbumInfo = {true} onPlay={onPlayCallback} onQueue={onQueueCallback} />}
  />
};

export default SongsList;
