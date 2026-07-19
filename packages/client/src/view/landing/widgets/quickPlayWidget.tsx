import React, { useContext } from "react"
import { Button } from "@ploot/pds";
import { PlayerContext } from "../../main";
import { QueueService } from "../../../services/queueService.ts";
import type { SongDTO } from "@ploot/plootunes-shared";

const QuickPlayWidget = () => {
    const { setShuffled, setCurrentlyPlayingSong } = useContext(PlayerContext)!;

    function playAllHandler() {
        QueueService.queueAllSongsAndPlayFirstSong().then((firstInQueue: SongDTO | null) => {
            if (!firstInQueue) return;
            setCurrentlyPlayingSong(firstInQueue);
            setShuffled(false);
        });
    }

    function shuffleAllHandler() {
        QueueService.shuffleAllSongsAndPlay().then((firstInQueue: SongDTO | null) => {
            if (!firstInQueue) return;
            setCurrentlyPlayingSong(firstInQueue);
            setShuffled(true);
        });
    }

    function playRandomArtistHandler() {
        QueueService.playRandomArtist().then((firstInQueue: SongDTO | null) => {
            if (!firstInQueue) return;
            setCurrentlyPlayingSong(firstInQueue);
            setShuffled(false);
        });
    }

    function playRandomAlbumHandler() {
        QueueService.playRandomAlbum().then((firstInQueue: SongDTO | null) => {
            if (!firstInQueue) return;
            setCurrentlyPlayingSong(firstInQueue);
            setShuffled(false);
        });
    }

    return <div className='p-col p-row-align-top'>
        <Button onClick={playAllHandler}>Play All</Button>
        <Button onClick={shuffleAllHandler}>Shuffle All</Button>
        <Button onClick={playRandomArtistHandler}>Play Random Artist</Button>
        <Button onClick={playRandomAlbumHandler}>Play Random Album</Button>
    </div>;
};

export default QuickPlayWidget;
