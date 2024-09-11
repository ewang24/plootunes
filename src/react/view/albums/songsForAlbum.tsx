import React, { useContext, useEffect, useState } from 'react';
import ViewContainer from '../global/viewContainer';
import { Song } from '../../../core/db/dbEntities/song';
import { ElectronUtil } from '../util/electronUtil';
import PButton from '../global/widgets/pButton';
import { PlayerContext } from '../main';

function SongsForAlbum({ album, closeSongsForAlbumView }) {

    const { playSongNow, queueSong } = useContext(PlayerContext);
    const [songs, setSongs] = useState<Song[]>(undefined);
    useEffect(() => {
        ElectronUtil.invoke('getSongsByAlbum', album.id)
            .then((songs: Song[]) => {
                console.log(songs);
                setSongs(songs);
            });
    }, []);

    function playSongCallback(songId: number) {
        playSongNow(songId);
    }

    function queueSongCallback(songId: number) {
        queueSong(songId);
    }

    function getLength(song: Song): string{
        return `${Math.floor(song.songLength/60)}:${Math.floor(song.songLength % 60)}`
    }

    return <>
        {/*start songs for album*/}
        <ViewContainer>
            <div className='p-row p-row-space-between'>
                <div className='p-row p-row-flex-start'>
                    <div className='album-songs-cover'>
                        <img draggable="false"
                            src='../../assets/img/test.jpg'
                        />
                    </div>
                    <div className='p-col p-row-flex-start p-row-align-top album-details-col'>
                        <h1 className='album-song-list-title'>
                            {album.name}
                        </h1>
                        <div className='album-sub-details'>
                            {album.artistName}
                        </div>
                        <div className='album-sub-details'>
                            2023
                        </div>
                        <div className='album-sub-details'>
                            1hr 69m
                        </div>
                    </div>
                </div>
                <button onClick={() => closeSongsForAlbumView()}>Back</button>
            </div>
            {
                songs && songs.length > 0 &&
                <table className='song-list'>
                    <thead>
                        <tr>
                            <th className='album-songs-table-header-cell'></th>
                            <th className='album-songs-table-header-cell'>#</th>
                            <th className='album-songs-table-header-cell'>Title</th>
                            <th className='album-songs-table-header-cell'>Plays</th>
                            <th className='album-songs-table-header-cell'>Length</th>
                        </tr>
                    </thead>
                    <tbody>
                        {songs.map((song: Song, index: number) => {
                            return <tr className={`song-album-row ${index % 2 == 0 ? 'song-album-even' : 'song-album-odd'}`} key={`${album}-song-${index}`}>
                                <td>
                                    <div className='p-row'>
                                        <PButton label='Play' onClick={() => { playSongCallback(song.id) }} />
                                        <PButton label='Queue' onClick={() => { queueSongCallback(song.id) }} />
                                    </div>
                                </td>
                                <td>
                                    <div className='p-row'>
                                        {index + 1}
                                    </div>
                                </td>
                                <td>
                                    {song.name}
                                </td>
                                <td>
                                    0
                                </td>
                                <td>
                                    {getLength(song)}
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table>

            }
            {/*end songs for album*/}
        </ViewContainer>
    </>
}

export default SongsForAlbum;
