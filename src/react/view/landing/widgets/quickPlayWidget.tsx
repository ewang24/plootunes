import React, { useContext } from "react"
import PButton from "../../global/widgets/pButton";
import { PlayerContext } from "../../main";
import { QueueService } from "../../albums/electronServices/queueService";
import { Song } from "../../../../core/db/dbEntities/song";

export interface QuickPlayWidgetProps {
}

const QuickPlayWidget = (props: QuickPlayWidgetProps) => {
    const { shuffled, setShuffled, repeat, setRepeat, currentlyPlayingSong, setCurrentlyPlayingSong } = useContext(PlayerContext);

    function playAllHandler(){
        QueueService.queueAllSongsAndPlayFirstSong().then((firstInQueue: Song) => {
            setCurrentlyPlayingSong(firstInQueue);
            setShuffled(false);
        });
    }

    function shuffleAllHandler(){
        QueueService.shuffleAllSongsAndPlay().then((firstInQueue: Song) => {
            setCurrentlyPlayingSong(firstInQueue);
            setShuffled(true);
          });
    }

    function playRandomArtistHandler(){
        QueueService.playRandomArtist().then((firstInQueue: Song) => {
            setCurrentlyPlayingSong(firstInQueue);
            setShuffled(false);
        })
    }

    function playRandomAlbumHandler(){
        QueueService.playRandomAlbum().then((firstInQueue: Song) => {
            setCurrentlyPlayingSong(firstInQueue);
            setShuffled(false);
        })
    }

    return <div className = 'p-col p-row-align-top'>
        <PButton label="Play All" onClick={playAllHandler}/>
        <PButton label="Shuffle All" onClick={shuffleAllHandler}/>
        <PButton label="Play Random Artist" onClick={playRandomArtistHandler}/>
        <PButton label="Play Random Album" onClick={playRandomAlbumHandler}/>
    </div>
}

export default QuickPlayWidget;