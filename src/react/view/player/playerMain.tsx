import React, { useEffect, useState } from 'react';
import '../../styles/player/player.scss'

const PlayerMain = () => {

    const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
    useEffect(() => {
        (window as any).electron.ipcRenderer.invoke('getAudioFileData')
            .then((data: Buffer) => {
                const blob = new Blob([data], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                setAudioSrc(url);
            });
    }, []);


    return <div className={'player-main'}>
        <div className = {'player-controls'}>
            {audioSrc &&
                <audio controls>
                    <source src={audioSrc} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            }
        </div>
    </div>
};

export default PlayerMain;