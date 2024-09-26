import React, { useContext, useEffect, useMemo, useState } from "react";
import { PlayerContext } from "../main";
import { Song, SongWithAlbum } from "../../../core/db/dbEntities/song";
import { QueueService } from "../albums/electronServices/queueService";
import PButton from "../global/widgets/pButton";
import { Icons } from "../../../core/assets/icons";
import '../../styles/queueViewer/queueViewer.scss'
import Header from "../global/widgets/header";
import { AutoSizer, List } from "react-virtualized";
import { SongsWithCurrentlyPlaying } from "../../../core/db/dbEntities/songWithCurrentlyPlaying";

const QueueViewer = () => {

    const { currentlyPlayingSong, setCurrentlyPlayingSong, shuffled } = useContext(PlayerContext);
    const [queuedSongs, setQueuedSongs] = useState<SongWithAlbum[] | undefined>();
    const [displayQueueViewer, setDisplayQueueViewer] = useState<boolean>(false);

    const currentlyPlayingSongIndex: number = useMemo((): number => {
        if(!currentlyPlayingSong){
            return 0;
        }

        return queuedSongs.findIndex((song) => song.id === currentlyPlayingSong.id);
    }, [queuedSongs])

    useEffect(() => {
        if (!displayQueueViewer) {
            return;
        }
        QueueService.getAllQueuedSongs().then((data: SongsWithCurrentlyPlaying) => {
            setQueuedSongs(data.songs);
        });
    }, [currentlyPlayingSong, displayQueueViewer, shuffled]);

    function toggleDisplayQueueViewer() {
        setDisplayQueueViewer(!displayQueueViewer);
    }

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

    function renderQueueRow({index, style, key}) {
        const song = queuedSongs[index];
        return <div className='p-row queue-viewer-row p-row-flex-start' key={key} style={style}>
            {
                (song.id === currentlyPlayingSong?.id) &&
                <div className='now-playing-queue-bar'></div>
            }
            {getAlbumArt(song.albumCoverImage, index)}
            <span className={(song.id === currentlyPlayingSong?.id) ? 'currently-playing' : ''}>
                {
                    `${song.name} - ${song.albumName || 'Unknown Album'} - ${song.artistName || 'Unknown Artist'}`
                }
            </span>
        </div>
    }

    return <div className={`p-col p-row-align-stretch queue-viewer ${displayQueueViewer ? 'queue-viewer-opened' : ''}`} key={currentlyPlayingSong?.id || 'none'}>
        {!displayQueueViewer &&
            <div className='queue-viewer-button'>
                <PButton label="Show Queue" displayLabel={false} icon={Icons.HAMBURGER} onClick={toggleDisplayQueueViewer} />
            </div>
        }
        {
            displayQueueViewer && queuedSongs && <>
                <Header label="Queue" />
                <div className='queue-viewer-button'>
                    <PButton label="Hide Queue" displayLabel={false} icon={Icons.X} onClick={toggleDisplayQueueViewer} />
                </div>

                <div className='queue-viewer-virtualizer-container'>
                    <div className='queue-viewer-virtualizer-block'>
                        <AutoSizer>
                            {({ height, width }) =>
                                <List className='queue-viewer-virtualized-list'
                                    height = {height}
                                    width = {width}
                                    rowCount={queuedSongs.length}
                                    rowHeight={50}
                                    rowRenderer={renderQueueRow}
                                    scrollToIndex={currentlyPlayingSongIndex}
                                />
                            }
                        </AutoSizer>
                    </div>
                </div>
            </>
        }
    </div>
}

export default QueueViewer;