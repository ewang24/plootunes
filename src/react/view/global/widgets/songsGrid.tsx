import React from "react";
import { Song } from "../../../../core/db/dbEntities/song";
import PButton from "./pButton";
import { Icons } from "../../../../core/assets/icons";

export interface SongsGridProps {
    songs?: Song[];
    onPlay: (song: Song) => void;
    onQueue: (song: Song) => void;
}

function SongsGrid(props: SongsGridProps) {
    const { songs, onPlay, onQueue } = props;
    return <>
        {(!songs || !songs.length) &&
            <strong>
                No songs found
            </strong>
        }
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
                        return <tr className={`song-album-row ${index % 2 == 0 ? 'song-album-even' : 'song-album-odd'}`} key={song.id}>
                            <td>
                                <div className='p-row'>
                                    <PButton label='Play' onClick={() => { onPlay(song) }} icon={Icons.PLAY} displayLabel={false} />
                                    <PButton label='Queue' onClick={() => { onQueue(song) }} icon={Icons.PLUS} displayLabel={false} />
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

function getLength(song: Song): string {
    return `${Math.floor(song.songLength / 60)}:${Math.floor(song.songLength % 60).toString().padStart(2, '0')}`
}

export default SongsGrid;