import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ElectronUtil } from '../util/electronUtil';
import { PlayerContext } from '../main';
import { AudioService } from '../albums/electronServices/audioService';
import { QueueService } from '../albums/electronServices/queueService';
import { Song } from '../../../core/db/dbEntities/song';
import PButton from '../global/widgets/pButton';
import { SystemService } from '../global/electronServices/systemService';
import { Icons } from '../../../core/assets/icons';

export interface PlayerProps {
    isPlaying: boolean;
}

function Player() {
    const { shuffled, setShuffled, repeat, setRepeat, currentlyPlayingSong, setCurrentlyPlayingSong } = useContext(PlayerContext);
    const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
    const audioPlayer = useRef(null);

    useEffect(() => {
        SystemService.isShuffled().then((shuffled: boolean) => {
            console.log(shuffled);
            setShuffled(shuffled);
        });
    }, [])

    useLayoutEffect(() => {
        return setUpAudioPlayerListeners();
    }, [audioSrc])

    useLayoutEffect(() => {
        processAudioSrc();
    }, [audioSrc]);

    useEffect(() => {
        processCurrentlyPlayingSong();
    }, [currentlyPlayingSong]);

    function setUpAudioPlayerListeners() {
        if (!audioPlayer.current) {
            return;
        }

        audioPlayer.current.addEventListener("ended", audioEnded);

        return () => {
            if (!audioPlayer?.current) {
                return;
            }
            audioPlayer.current.removeEventListener("ended", audioEnded);
        }
    }

    async function audioEnded() {
        const nextSongInQueue: Song = await QueueService.getNextSongInQueue()
        if (!nextSongInQueue) {
            return;
        }

        QueueService.transitionCurrentSong(nextSongInQueue.id).then(() => {
            setCurrentlyPlayingSong(nextSongInQueue);
        })
            .catch((err) => {
                window.alert(`Fatal error: ${JSON.stringify(err, null, 2)}`)
            })
    }

    function processAudioSrc() {
        if (!audioSrc) {
            return;
        }

        if (!audioPlayer.current) {
            window.alert("Fatal error! Audio player not available. Please restart the application.")
        }
        audioPlayer.current.play();
    }

    function processCurrentlyPlayingSong() {
        if (!currentlyPlayingSong) {
            return;
        }

        AudioService.getSongBuffer(currentlyPlayingSong.id)
            .then((data: Buffer) => {
                processAudioBuffer(data);
            });
    }

    function processAudioBuffer(data: Buffer) {
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
    }

    function setRepeatHandler() {
        setRepeat(!repeat);
    }

    function setShuffledHandler() {
        if (!shuffled) {
            QueueService.shuffleCurrentQueue();
        }
        setShuffled(!shuffled);
    }

    return <div className={'player-controls'}>
        {audioSrc &&
            <div className='p-row player-controls-row'>
                <PButton label='Repeat' 
                    displayLabel = {false}
                    icon={Icons.REPEAT_CIRCLE}
                    onClick={setRepeatHandler} 
                    fill={'#B7E1CC'} 
                    iconType='borderless'
                    iconSize='medium'
                />
                <PButton label='Shuffle'
                    displayLabel={false}
                    icon={Icons.SHUFFLE}
                    onClick={setShuffledHandler}
                    fill={ shuffled? '#B7E1CC': undefined}
                    iconType='borderless'
                    iconSize='medium'
                />
                <strong>
                    {
                        currentlyPlayingSong.name
                    }
                </strong>
                <audio ref={audioPlayer} key={audioSrc} controls>
                    <source src={audioSrc} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            </div>
        }
    </div>
}

export default Player;