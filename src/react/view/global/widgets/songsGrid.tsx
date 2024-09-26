import React, { FC } from "react";
import { Song, SongWithAlbum } from "../../../../core/db/dbEntities/song";
import PButton from "./pButton";
import { Icons } from "../../../../core/assets/icons";
import { AutoSizer, Column, Table } from "react-virtualized";
import '../../../styles/widgets/songsGrid.scss'

export interface SongsGridProps {
    songs?: SongWithAlbum[];
    displayAlbumInfo?: boolean;
    onPlay: (song: Song) => void;
    onQueue: (song: Song) => void;
}

function SongsGrid(props: SongsGridProps) {
    const { songs, onPlay, onQueue, displayAlbumInfo } = props;

    function getAlbumArt(albumCoverImageUrl: string | undefined, index: number) {
        return <div key={index} className='p-tile p-tile-ultra-small'>
            <div className='p-tile-image'>
                <>
                    {albumCoverImageUrl &&
                        <img draggable="false"
                            src={`http://localhost:3030/${albumCoverImageUrl}`}
                        />
                    }
                    {!albumCoverImageUrl &&
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
    }

    function renderRowActions(song: Song) {
        return <div className='p-row'>
            <PButton label='Play' onClick={() => { onPlay(song) }} icon={Icons.PLAY} displayLabel={false} />
            <PButton label='Queue' onClick={() => { onQueue(song) }} icon={Icons.PLUS} displayLabel={false} />
        </div>
    }

    const totalColumns = 3 + (displayAlbumInfo ? 2 : 0);

    return <>
        {(!songs || !songs.length) &&
            <strong>
                No songs found
            </strong>
        }
        {
            songs && songs.length > 0 &&
            <div className='song-grid-virtualizer-container'>
                <div className='song-grid-virtualizer-block'>
                    <AutoSizer>
                        {({ height, width }) => {
                            return <Table height={height}
                                width={width}
                                rowCount={songs.length}
                                rowGetter={({ index }) => songs[index]}
                                rowHeight={50}
                                headerHeight={50}
                                rowClassName={'virtualized-song-grid-row'}
                            >
                                <Column
                                    width={width / totalColumns}
                                    disableSort
                                    label="Actions"
                                    dataKey="id"
                                    cellRenderer={({ rowData }) => renderRowActions(rowData)}
                                // flexGrow={1}
                                />
                                <Column
                                    width={width / totalColumns}
                                    disableSort
                                    label="Position"
                                    dataKey="songPosition"
                                    cellRenderer={({ cellData }) => cellData}
                                // flexGrow={1}
                                />
                                {displayAlbumInfo &&
                                    <Column
                                        width={width / totalColumns}
                                        disableSort
                                        label="Album"
                                        dataKey="albumCoverImage"
                                        cellRenderer={({ cellData, rowIndex }) => { return getAlbumArt(cellData, rowIndex) }}
                                    // flexGrow={1}
                                    />
                                }
                                <Column
                                    width={width / totalColumns}
                                    disableSort
                                    label="Title"
                                    dataKey="name"
                                    cellRenderer={({ cellData }) => cellData}
                                // flexGrow={1}
                                />
                                {displayAlbumInfo &&
                                    <Column
                                        width={width / totalColumns}
                                        disableSort
                                        label="Artist "
                                        dataKey="artistName"
                                        cellRenderer={({ cellData }) => cellData}
                                    // flexGrow={1}
                                    />
                                }
                                {/* <Column
                                disableSort
                                label="Plays"
                                dataKey="plays"
                                cellRenderer={({ plays }) => plays}
                                flexGrow={1}
                            /> */}
                                <Column
                                    width={width / totalColumns}
                                    disableSort
                                    label="Length"
                                    dataKey="songLength"
                                    cellRenderer={({ cellData }) => getLength(cellData)}
                                // flexGrow={1}
                                />
                            </Table>
                        }}
                    </AutoSizer>
                </div>
            </div>
        }
    </>
}

function getLength(songLength: number | undefined): string {
    if (songLength === undefined) {
        return '0:00';
    }
    return `${Math.floor(songLength / 60)}:${Math.floor(songLength % 60).toString().padStart(2, '0')}`
}

export default SongsGrid;