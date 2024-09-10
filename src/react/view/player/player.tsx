import React, { useContext, useEffect, useRef, useState } from 'react';
import { ElectronUtil } from '../util/electronUtil';
import { PlayerContext } from '../main';
import { AudioService } from '../albums/electronServices/audioService';

export interface PlayerProps {
    isPlaying: boolean;
}

function Player() {
    const { currentlyPlayingSong } = useContext(PlayerContext);
    const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
    const audioPlayer = useRef(null);

    useEffect(() => {
        debugger;
        if(!audioSrc){
            return;
        }

        if(!audioPlayer.current){
            window.alert("Fatal error! Audio player not available. Please restart the application.")
        }
        audioPlayer.current.play();
    }, [audioSrc]);

    useEffect(() => {
        debugger;
        if (!currentlyPlayingSong) {
            return;
        }

        AudioService.getSongBuffer(currentlyPlayingSong)
            .then((data: Buffer) => {
                processAudioBuffer(data);
            });

    }, [currentlyPlayingSong]);

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