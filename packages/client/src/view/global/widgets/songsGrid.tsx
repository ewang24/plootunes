import React, { useMemo } from "react";
import { Button } from "@ploot/pds";
import type { SongDTO } from "@ploot/plootunes-shared";
import { AutoSizer, Column, ColumnProps, Table } from "react-virtualized";
import { thumbUrl } from "../../../services/covers.ts";
import testImg from '../../../assets/img/test.jpg'
import upImg from '../../../assets/img/up.jpg'
import '../../../styles/widgets/songsGrid.scss'

export interface SongsGridProps {
  songs?: SongDTO[];
  displayAlbumInfo?: boolean;
  onPlay: (song: SongDTO) => void;
  onQueue: (song: SongDTO) => void;
}

function SongsGrid({ songs, onPlay, onQueue, displayAlbumInfo }: SongsGridProps) {

  function getAlbumArt(albumCoverImageUrl: string | null | undefined, index: number) {
    return <div className='p-row'>
      <div key={index} className='p-tile p-tile-ultra-small'>
        <div className='p-tile-image'>
          {albumCoverImageUrl
            ? <img draggable="false" src={thumbUrl(albumCoverImageUrl)} />
            : <img draggable="false" src={index % 2 === 0 ? testImg : upImg} />
          }
        </div>
      </div>
    </div>;
  }

  function renderRowActions(song: SongDTO) {
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

  type ColumnDef = Partial<ColumnProps> & Pick<ColumnProps, 'dataKey'>;

  const columnDefs = useMemo<ColumnDef[]>((): ColumnDef[] => {
    const cols: ColumnDef[] = [
      {
        dataKey: "id",
        headerRenderer: () => renderColumnHeader("Actions"),
        cellRenderer: ({ rowData }) => renderRowActions(rowData),
      },
      {
        headerRenderer: () => renderColumnHeader("Track #"),
        dataKey: "trackNumber",
        cellRenderer: ({ cellData }) => wrapStringRowCell(cellData),
      },
    ];

    if (displayAlbumInfo) {
      cols.push({
        headerRenderer: () => renderColumnHeader("Album"),
        dataKey: "coverImage",
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
        dataKey: "durationMs",
        cellRenderer: ({ cellData }) => wrapStringRowCell(getLength(cellData)),
      },
    );

    return cols;
  }, [displayAlbumInfo]);

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

function getLength(durationMs: number | null | undefined): string {
  if (durationMs === undefined || durationMs === null) return '0:00';
  const totalSeconds = durationMs / 1000;
  return `${Math.floor(totalSeconds / 60)}:${Math.floor(totalSeconds % 60).toString().padStart(2, '0')}`;
}

export default SongsGrid;
