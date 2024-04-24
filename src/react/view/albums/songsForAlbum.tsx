import React, { useEffect, useState } from 'react';
import { Song } from '../../../../global/dbEntities/song';
import { Album } from '../../../../global/dbEntities/album';
import ViewContainer from '../global/viewContainer';

const SongsForAlbum: React.FC<{ album: Album, closeSongsForAlbumView: Function }> = ({ album, closeSongsForAlbumView }) => {

    const [songs, setSongs] = useState<Song[]>(undefined)
    useEffect(() => {
        (window as any).electron.ipcRenderer.invoke('getSongsByAlbum', album.id)
            .then((songs: Song[]) => {
                setSongs(songs);
            });
    }, [])

    return <ViewContainer>
        <div className='p-row'>
            <button onClick={() => closeSongsForAlbumView()}>Back</button>
            {album.name}
        </div>
        {
            songs && songs.length > 0 &&
            <>
                {songs.map((song: Song, index: number) => {
                    return <div className = {`song-album-row ${index%2==0? 'song-album-even': 'song-album-odd'}`} key = {`${album}-song-${index}`}>
                        {`#${index} ${song.name}`}
                    </div>
                })}
            </>

        }
    </ViewContainer>;
};

export default SongsForAlbum;
