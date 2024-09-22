import React, { useContext, useEffect, useState } from 'react';
import ViewContainer from '../global/viewContainer';
import { Song } from '../../../core/db/dbEntities/song';
import { ElectronUtil } from '../util/electronUtil';
import PButton from '../global/widgets/pButton';
import { PlayerContext } from '../main';
import { QueueService } from './electronServices/queueService';
import { Icons } from '../../../core/assets/icons';
import { SongService } from '../songs/electronServices/songService';
import SongsGrid from '../global/widgets/songsGrid';

function SongsForAlbum({ album, closeSongsForAlbumView }) {

    const { playSongNow, setShuffled, queueSong, setCurrentlyPlayingSong, currentlyPlayingSong } = useContext(PlayerContext);
    const [songs, setSongs] = useState<Song[]>(undefined);
    useEffect(() => {
        SongService.getSongsByAlbum(album.id)
            .then((songs: Song[]) => {
                console.log(songs);
                setSongs(songs);
            });
    }, []);

    function playAlbumCallback() {
        QueueService.playAlbum(album.id).then(() => {
            setCurrentlyPlayingSong(songs[0]);
            setShuffled(false);
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
        setShuffled(false);
        playSongNow(song);
    }

    function queueSongCallback(song: Song) {
        queueSong(song);
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

    function songList() {
        return <SongsGrid songs={songs} onPlay={playSongCallback} onQueue={queueSongCallback}/>
    }

    return <ViewContainer
        header={header()}
        content={songList()}
    />
}

export default SongsForAlbum;
