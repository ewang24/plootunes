import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button, Page } from "@ploot/pds";
import { PlayerContext } from "../main";
import type { QueuedSongsDTO, SongDTO } from "@ploot/plootunes-shared";
import { QueueService } from "../../services/queueService.ts";
import { thumbUrl } from "../../services/covers.ts";
import testImg from '../../assets/img/test.jpg'
import upImg from '../../assets/img/up.jpg'
import '../../styles/queueViewer/queueViewer.scss'
import { AutoSizer, List, ListRowProps } from "react-virtualized";

const QueueViewer = () => {
  const { currentlyPlayingSong, setCurrentlyPlayingSong, shuffled } = useContext(PlayerContext)!;
  const [queuedSongs, setQueuedSongs] = useState<SongDTO[] | undefined>();
  const [displayQueueViewer, setDisplayQueueViewer] = useState<boolean>(false);

  const currentlyPlayingSongIndex: number = useMemo((): number => {
    if (!currentlyPlayingSong || !queuedSongs) return 0;
    return queuedSongs.findIndex((song) => song.id === currentlyPlayingSong.id);
  }, [queuedSongs]);

  useEffect(() => {
    if (!displayQueueViewer) return;
    QueueService.getAllQueuedSongs().then((data: QueuedSongsDTO) => setQueuedSongs(data.songs));
  }, [currentlyPlayingSong, displayQueueViewer, shuffled]);

  function toggleDisplayQueueViewer() {
    setDisplayQueueViewer(!displayQueueViewer);
  }

  function getAlbumArt(albumCoverImageUrl: string | null | undefined, index: number) {
    return <div key={index} className='p-tile p-tile-ultra-small'>
      <div className='p-tile-image'>
        {albumCoverImageUrl
          ? <img draggable="false" src={thumbUrl(albumCoverImageUrl)} />
          : <img draggable="false" src={index % 2 === 0 ? testImg : upImg} />
        }
      </div>
    </div>;
  }

  function renderQueueRow({ index, style, key }: ListRowProps) {
    const song = queuedSongs![index];
    const songInfo = `${song.name} - ${song.albumName || 'Unknown Album'} - ${song.artistName || 'Unknown Artist'}`;
    return <div className='p-row queue-viewer-row p-row-flex-start' key={key} style={style} title={songInfo}>
      {song.id === currentlyPlayingSong?.id && <div className='now-playing-queue-bar' />}
      {getAlbumArt(song.coverImage, index)}
      <span className={song.id === currentlyPlayingSong?.id ? 'currently-playing' : ''}>
        {songInfo}
      </span>
    </div>;
  }

  return <div className={`p-col p-row-align-stretch queue-viewer ${displayQueueViewer ? 'queue-viewer-opened' : ''}`} key={currentlyPlayingSong?.id || 'none'}>
    {!displayQueueViewer &&
      <div className='queue-viewer-button'>
        <Button icon='hamburger' variant='ghost' onClick={toggleDisplayQueueViewer} title='Show Queue' />
      </div>
    }
    {displayQueueViewer && queuedSongs && <>
      <div className='p-row p-row-space-between queue-viewer-header'>
        <strong>Queue</strong>
        <Button icon='x' variant='ghost' onClick={toggleDisplayQueueViewer} title='Hide Queue' />
      </div>
      <div className='queue-viewer-virtualizer-container'>
        <div className='queue-viewer-virtualizer-block'>
          <AutoSizer>
            {({ height, width }) =>
              <List
                className='queue-viewer-virtualized-list'
                height={height}
                width={width}
                rowCount={queuedSongs.length}
                rowHeight={50}
                rowRenderer={renderQueueRow}
                scrollToIndex={currentlyPlayingSongIndex}
              />
            }
          </AutoSizer>
        </div>
      </div>
    </>}
  </div>;
};

export default QueueViewer;
