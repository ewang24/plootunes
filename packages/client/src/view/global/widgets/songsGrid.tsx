import React, { useMemo } from "react";
import { Button } from "@ploot/pds";
import { Song, SongWithAlbum } from "../../../../core/db/dbEntities/song";
import { AutoSizer, Column, ColumnProps, Table } from "react-virtualized";
import '../../../styles/widgets/songsGrid.scss'

export interface SongsGridProps {
  songs?: SongWithAlbum[];
  displayAlbumInfo?: boolean;
  onPlay: (song: Song) => void;
  onQueue: (song: Song) => void;
}

function SongsGrid({ songs, onPlay, onQueue, displayAlbumInfo }: SongsGridProps) {

  function getAlbumArt(albumCoverImageUrl: string | undefined, index: number) {
    return <div className='p-row'>
      <div key={index} className='p-tile p-tile-ultra-small'>
        <div className='p-tile-image'>
          {albumCoverImageUrl
            ? <img draggable="false" src={`http://localhost:3030/${albumCoverImageUrl}`} />
            : <img draggable="false" src={index % 2 === 0 ? '../../assets/img/test.jpg' : '../../assets/img/up.jpg'} />
          }
        </div>
      </div>
    </div>;
  }

  function renderRowActions(song: Song) {
    return <div className='p-row'>
      <Button icon='play' size='sm' onClick={() => onPlay(song)} title='Play' />
      <Button icon='plus' size='sm' variant='secondary' onClick={() => onQueue(song)} title='Queue' />
    </div>;
  }

  function wrapStringRowCell(content: string) {
    return <div className='p-row'>{content}</div>;
  }

  function renderColumnHeader(columnName: string) {
    return <div className='p-row'><strong>{columnName}</strong></div>;
  }

  const columnDefs = useMemo<Partial<ColumnProps>[]>((): Partial<ColumnProps>[] => {
    const cols: Partial<ColumnProps>[] = [
      {
        dataKey: "id",
        headerRenderer: () => renderColumnHeader("Actions"),
        cellRenderer: ({ rowData }) => renderRowActions(rowData),
      },
      {
        headerRenderer: () => renderColumnHeader("Track #"),
        dataKey: "songPosition",
        cellRenderer: ({ cellData }) => wrapStringRowCell(cellData),
      },
    ];

    if (displayAlbumInfo) {
      cols.push({
        headerRenderer: () => renderColumnHeader("Album"),
        dataKey: "albumCoverImage",
        cellRenderer: ({ cellData, rowIndex }) => getAlbumArt(cellData, rowIndex),
      });
    }

    cols.push({
      headerRenderer: () => renderColumnHeader("Title"),
      dataKey: "name",
      cellRenderer: ({ cellData }) => wrapStringRowCell(cellData),
    });

    if (displayAlbumInfo) {
      cols.push({
        headerRenderer: () => renderColumnHeader("Artist"),
        dataKey: "artistName",
        cellRenderer: ({ cellData }) => wrapStringRowCell(cellData),
      });
    }

    cols.push(
      {
        headerRenderer: () => renderColumnHeader("# Plays"),
        dataKey: "plays",
        cellRenderer: () => wrapStringRowCell('0'),
      },
      {
        headerRenderer: () => renderColumnHeader("Length"),
        dataKey: "songLength",
        cellRenderer: ({ cellData }) => wrapStringRowCell(getLength(cellData)),
      },
    );

    return cols;
  }, []);

  if (!songs || !songs.length) return <strong>No songs found</strong>;

  return <div className='song-grid-virtualizer-container'>
    <div className='song-grid-virtualizer-block'>
      <AutoSizer>
        {({ height, width }) =>
          <Table
            height={height}
            width={width}
            rowCount={songs.length}
            rowGetter={({ index }) => songs[index]}
            rowHeight={50}
            headerHeight={50}
            rowClassName='virtualized-song-grid-row'
          >
            {columnDefs.map((colProps) => (
              <Column
                key={colProps.dataKey}
                width={width / columnDefs.length}
                cellDataGetter={({ dataKey, rowData }) => rowData?.[dataKey]}
                {...colProps}
              />
            ))}
          </Table>
        }
      </AutoSizer>
    </div>
  </div>;
}

function getLength(songLength: number | undefined): string {
  if (songLength === undefined) return '0:00';
  return `${Math.floor(songLength / 60)}:${Math.floor(songLength % 60).toString().padStart(2, '0')}`;
}

export default SongsGrid;
