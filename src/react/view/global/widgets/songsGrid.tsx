import React from "react";
import { Song, SongWithAlbum } from "../../../../core/db/dbEntities/song";
import PButton from "./pButton";
import { Icons } from "../../../../core/assets/icons";

export interface SongsGridProps {
    songs?: SongWithAlbum[];
    displayAlbumInfo?: boolean;
    onPlay: (song: Song) => void;
    onQueue: (song: Song) => void;
}

function SongsGrid(props: SongsGridProps) {
    const { songs, onPlay, onQueue, displayAlbumInfo } = props;
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
                        {displayAlbumInfo &&
                            <th className='album-songs-table-header-cell'>Album</th>
                        }
                        <th className='album-songs-table-header-cell'>Title</th>
                        {displayAlbumInfo &&
                            <th className='album-songs-table-header-cell'>Artist</th>
                        }
                        <th className='album-songs-table-header-cell'>Plays</th>
                        <th className='album-songs-table-header-cell'>Length</th>
                    </tr>
                </thead>
                <tbody>
                    {songs.map((song: SongWithAlbum, index: number) => {
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
                            {displayAlbumInfo &&
                                <td>
                                    <div key={index} className='p-tile p-tile-ultra-small'>
                                        <div className='p-tile-image'>
                                            <>
                                                {song.albumCoverImage &&
                                                    <img draggable="false"
                                                        src={`http://localhost:3030/${song.albumCoverImage}`}
                                                    />
                                                }
                                                {!song.albumCoverImage &&
                                                    <>
                                                        {index % 2 === 0 &&
                                                            <img draggable="false"
                                                                src='../../assets/img/test.jpg'
                                                            />
                                                        }
                                                        {index % 2 !== 0 &&
                                                            <img draggable="false"
                                                                src='../../assets/img/up.jpg'
                                                            />
                                                        }
                                                    </>
                                                }
                                            </>
                                        </div>
                                    </div>
                                </td>
                            }
                            <td>
                                {song.name}
                            </td>
                            {displayAlbumInfo &&
                            <td>
                                {song.artistName}
                            </td>
                            }
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