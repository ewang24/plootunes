import React, { useContext, useEffect, useState } from 'react';
import { Song } from '../../../core/db/dbEntities/song';
import { SongService } from './electronServices/songService';
import SongsGrid from '../global/widgets/songsGrid';
import ViewContainer from '../global/viewContainer';
import Header from '../global/widgets/header';
import { QueueService } from '../albums/electronServices/queueService';
import { PlayerContext } from '../main';
import PButton from '../global/widgets/pButton';

const SongsList = () => {

  const { queueSong, setCurrentlyPlayingSong, currentlyPlayingSong, setShuffled } = useContext(PlayerContext);
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
      setShuffled(false);
    });
  }

  function onQueueCallback(song: Song) {
    queueSong(song);
  }

  function shuffleAndPlayAllSongs(){
    QueueService.shuffleAllSongsAndPlay().then((firstInQueue: Song) => {
      setCurrentlyPlayingSong(firstInQueue);
      setShuffled(true);
    });
  }

  function content(){
    return <>
      <div className = 'p-row'>
        <PButton label='Shuffle All' onClick={shuffleAndPlayAllSongs}/>
      </div>
      <SongsGrid songs={songs} displayAlbumInfo = {true} onPlay={onPlayCallback} onQueue={onQueueCallback} />
    </>
  }

  return <ViewContainer
    header={<Header label='All Songs'/>}
    content={content()}
  />
};

export default SongsList;
