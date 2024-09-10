import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ElectronUtil } from '../util/electronUtil';
import { PlayerContext } from '../main';
import { AudioService } from '../albums/electronServices/audioService';
import { QueueService } from '../albums/electronServices/queueService';
import { Song } from '../../../core/db/dbEntities/song';

export interface PlayerProps {
    isPlaying: boolean;
}

function Player() {
    const { currentlyPlayingSong, setCurrentlyPlayingSong } = useContext(PlayerContext);
    const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
    const audioPlayer = useRef(null);

    useLayoutEffect(() => {
        return setUpAudioPlayerListeners();
    }, [audioSrc])

    useLayoutEffect(() => {
        processAudioSrc();
    }, [audioSrc]);

    useEffect(() => {
        processCurrentlyPlayingSong();
    }, [currentlyPlayingSong]);

    function setUpAudioPlayerListeners(){
        // console.log('setting up ending audio listener');
        if(!audioPlayer.current){
            return;
        }

        audioPlayer.current.addEventListener("ended", audioEnded);
        // console.log('audio player listener created');

        return () =>{
            if(!audioPlayer?.current){
                return;
            }
            audioPlayer.current.removeEventListener("ended", audioEnded);
        }
    }

    async function audioEnded(){
        const nextSongInQueue: Song = await QueueService.getNextSongInQueue()
        if(!nextSongInQueue){
            return;
        }

        QueueService.transitionCurrentSong(nextSongInQueue.id).then(() => {
            setCurrentlyPlayingSong(nextSongInQueue.id);
        })
        .catch((err) => {
            window.alert(`Fatal error: ${JSON.stringify(err, null, 2)}`)
        })
    }

    function processAudioSrc(){
        if(!audioSrc){
            return;
        }

        if(!audioPlayer.current){
            window.alert("Fatal error! Audio player not available. Please restart the application.")
        }
        audioPlayer.current.play();
    }

    function processCurrentlyPlayingSong(){
        if (!currentlyPlayingSong) {
            return;
        }

        AudioService.getSongBuffer(currentlyPlayingSong)
            .then((data: Buffer) => {
                processAudioBuffer(data);
            });
    }

    function processAudioBuffer(data: Buffer) {
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
    }

    return <div className={'player-controls'}>
        {audioSrc &&
            <audio ref = {audioPlayer} key = {audioSrc} controls>
                <source src={audioSrc} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        }
    </div>
}

export default Player;