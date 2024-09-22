import React, { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../main";
import { Song } from "../../../core/db/dbEntities/song";
import { QueueService } from "../albums/electronServices/queueService";
import PButton from "../global/widgets/pButton";
import { Icons } from "../../../core/assets/icons";
import '../../styles/queueViewer/queueViewer.scss'
import Header from "../global/widgets/header";

const QueueViewer = () => {

    const { currentlyPlayingSong, setCurrentlyPlayingSong, shuffled } = useContext(PlayerContext);
    const [queuedSongs, setQueuedSongs] = useState<Song[] | undefined>();
    const [displayQueueViewer, setDisplayQueueViewer] = useState<boolean>(false);

    useEffect(() => {
        if (!displayQueueViewer) {
            return;
        }
        QueueService.getAllQueuedSongs().then((songs: Song[]) => {
            setQueuedSongs(songs);
        });
    }, [currentlyPlayingSong, displayQueueViewer, shuffled]);

    function toggleDisplayQueueViewer() {
        setDisplayQueueViewer(!displayQueueViewer);
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
                {queuedSongs.map((song, index) => {
                    return <div className='p-row queue-viewer-row p-row-flex-start' key={song.id}>
                        {
                            (song.id === currentlyPlayingSong?.id) &&
                            <div className = 'now-playing-queue-bar'></div>
                        }
                        <span className={(song.id === currentlyPlayingSong?.id) ? 'currently-playing' : ''}>
                            {
                                song.name
                            }
                        </span>
                    </div>
                })}
            </>
        }
    </div>
}

export default QueueViewer;