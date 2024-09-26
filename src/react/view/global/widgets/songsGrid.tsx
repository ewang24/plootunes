import React, { FC, useMemo, useRef } from "react";
import { Song, SongWithAlbum } from "../../../../core/db/dbEntities/song";
import PButton from "./pButton";
import { Icons } from "../../../../core/assets/icons";
import { AutoSizer, Column, ColumnProps, Table } from "react-virtualized";
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
        return <div className = 'p-row p-row-center'>
            <div key={index} className='p-tile p-tile-ultra-small'>
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
        </div>
    }

    function renderRowActions(song: Song) {
        return <div className='p-row'>
            <PButton label='Play' onClick={() => { onPlay(song) }} icon={Icons.PLAY} displayLabel={false} />
            <PButton label='Queue' onClick={() => { onQueue(song) }} icon={Icons.PLUS} displayLabel={false} />
        </div>
    }

    function wrapStringRowCell(content: string) {
        return <div className='p-row p-row-center'>
            {content}
        </div>
    }

    function renderColumnHeader(columnName: string) {
        return <div className='p-row p-row-center'>
            <strong>
                {columnName}
            </strong>
        </div>
    }

    const columnDefs = useMemo<Partial<ColumnProps>[]>((): Partial<ColumnProps>[] => {
        const cols: Partial<ColumnProps>[] = [
            {
                dataKey: "id",
                headerRenderer: () => renderColumnHeader("Actions"),
                cellRenderer: ({ rowData }) => renderRowActions(rowData)
            },
            {
                headerRenderer: () => renderColumnHeader("Track #"),
                dataKey: "songPosition",
                cellRenderer: ({ cellData }) => wrapStringRowCell(cellData)
            }
        ];

        if (displayAlbumInfo) {
            cols.push(
                {
                    headerRenderer: () => renderColumnHeader("Album"),
                    dataKey: "albumCoverImage",
                    cellRenderer: ({ cellData, rowIndex }) => { return getAlbumArt(cellData, rowIndex) }
                },
            )
        }

        cols.push(
            {
                headerRenderer: () => renderColumnHeader("Title"),
                dataKey: "name",
                cellRenderer: ({ cellData }) => wrapStringRowCell(cellData)
            }
        );

        if (displayAlbumInfo) {
            cols.push(
                {
                    headerRenderer: () => renderColumnHeader("Artist"),
                    dataKey: "artistName",
                    cellRenderer: ({ cellData }) => wrapStringRowCell(cellData)
                }
            );
        }

        cols.push(...[
            {
                headerRenderer: () => renderColumnHeader("# Plays"),
                dataKey: "plays",
                cellRenderer: ({ cellData }) => wrapStringRowCell('0')
            },
            {
                headerRenderer: () => renderColumnHeader("Length"),
                dataKey: "songLength",
                cellRenderer: ({ cellData }) => wrapStringRowCell(getLength(cellData))
            }
        ] as Partial<ColumnProps>[]);

        return cols;
    }, []);

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
                    {/* The autosizer must be wrapped in a component with defined width/height. song-grid-virtualizer-block is a block element with a set width/height */}
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
                                {
                                    columnDefs.map((colProps) => {
                                        return <Column
                                            width={width / columnDefs.length}
                                            {...colProps}
                                        />
                                    })
                                }
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