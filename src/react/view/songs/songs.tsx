import React, { useEffect, useState } from 'react';
import { Song } from '../../../core/db/dbEntities/song';
import { SongService } from './electronServices/songService';

const SongsList = () => {
  const [songs, setSongs] = useState<Song[] | undefined>();

    useEffect(() => {
        SongService.getSongs().then((songs: Song[]) => {
            setSongs(songs);
        })
    }, []);
  return <div className = 'p-col'>
  {
      songs && 
      <>
          {songs.map((song) => {
              return <div className = 'p-row'>
                  {song.name}
              </div>
          })}
      </>
  }
</div>
};

export default SongsList;
