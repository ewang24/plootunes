import React, { useContext, useEffect, useState } from 'react';
import ViewContainer from '../global/viewContainer';
import { Song } from '../../../core/db/dbEntities/song';
import { ElectronUtil } from '../util/electronUtil';
import PButton from '../global/widgets/pButton';
import { PlayerContext } from '../main';
import { QueueService } from './electronServices/queueService';
import { Icons } from '../../../core/assets/icons';

function SongsForAlbum({ album, closeSongsForAlbumView }) {

    const { playSongNow, queueSong, setCurrentlyPlayingSong, currentlyPlayingSong } = useContext(PlayerContext);
    const [songs, setSongs] = useState<Song[]>(undefined);
    useEffect(() => {
        ElectronUtil.invoke('getSongsByAlbum', album.id)
            .then((songs: Song[]) => {
                console.log(songs);
                setSongs(songs);
            });
    }, []);

    function playAlbumCallback() {
        QueueService.playAlbum(album.id).then(() => {
            setCurrentlyPlayingSong(songs[0]);
        });
    }

    function queueAlbumCallback() {
        QueueService.queueAlbum(album.id).then(() => {
            if (currentlyPlayingSong) {
                setCurrentlyPlayingSong(songs[0]);
            }
        });
    }

    function playSongCallback(song: Song) {
        playSongNow(song);
    }

    function queueSongCallback(song: Song) {
        queueSong(song);
    }

    function getLength(song: Song): string {
        return `${Math.floor(song.songLength / 60)}:${Math.floor(song.songLength % 60).toString().padStart(2, '0')}`
    }

    function header() {
        return <div className='p-row p-row-space-between'>
            <div className='p-col'>
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
                <div className='p-row'>
                    <PButton label='Play Album' onClick={playAlbumCallback} />
                    <PButton label='Queue Album' onClick={queueAlbumCallback} />
                </div>
            </div>
            <PButton onClick={() => closeSongsForAlbumView()} label='Back' displayLabel={false} icon={Icons.BACK_ARROW} />
        </div>;
    }

    function albumList() {
        return <>
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
                                        <PButton label='Play' onClick={() => { playSongCallback(song) }} icon={Icons.PLAY} displayLabel={false} />
                                        <PButton label='Queue' onClick={() => { queueSongCallback(song) }} icon={Icons.PLUS} displayLabel={false} />
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
        </>
    }

    return <ViewContainer
        header={header()}
        content={albumList()}
    />
}

export default SongsForAlbum;
