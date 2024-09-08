import React, { useEffect, useState } from 'react';
import { ElectronUtil } from '../util/electronUtil';

export interface PlayerProps {
    isPlaying: boolean;
}

function Player(props: PlayerProps) {
    const { isPlaying } = props;
    const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!isPlaying) {
            return;
        }

        ElectronUtil.invoke('getQueuedSongToPlay')
            .then((data: Buffer) => {
                processAudioBuffer(data);
            });
    }, [isPlaying]);

    function processAudioBuffer(data: Buffer) {
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
    }

    return <div className={'player-controls'}>
        {audioSrc &&
            <audio controls>
                <source src={audioSrc} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        }
    </div>
}

export default Player;