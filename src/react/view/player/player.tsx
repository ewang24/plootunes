import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ElectronUtil } from '../util/electronUtil';
import { PlayerContext } from '../main';
import { AudioService } from '../albums/electronServices/audioService';
import { QueueService } from '../albums/electronServices/queueService';
import { Song } from '../../../core/db/dbEntities/song';
import PButton from '../global/widgets/pButton';
import { SystemService } from '../global/electronServices/systemService';
import { Icons } from '../../../core/assets/icons';
import { StatService } from './electronServices/statService';

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

        return () => {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
                navigator.mediaSession.metadata = null;
            }
        };
    }, [currentlyPlayingSong]);

    function setUpAudioPlayerListeners() {
        if (!audioPlayer.current) {
            return;
        }

        audioPlayer.current.addEventListener("ended", playNextSong);

        return () => {
            if (!audioPlayer?.current) {
                return;
            }
            audioPlayer.current.removeEventListener("ended", playNextSong);
        }
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

                if ('mediaSession' in navigator) {
                    const artwork = [];

                    if(currentlyPlayingSong.albumCoverImage){
                        artwork.push({ src: `http://localhost:3030/${currentlyPlayingSong.albumCoverImage}`, sizes: '128x128', type: 'image/jpeg' });
                    }

                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: currentlyPlayingSong.name,
                        artist: currentlyPlayingSong.artistName || 'Unknown Artist',
                        album: currentlyPlayingSong.albumName || 'Unknown Album',
                        artwork: artwork
                    });
        
                    // Set up media session action handlers
                    navigator.mediaSession.setActionHandler('play', () => {
                        // Handle play action
                    });
                    navigator.mediaSession.setActionHandler('pause', () => {
                        // Handle pause action
                    });
                    navigator.mediaSession.setActionHandler('previoustrack', () => {
                        // Handle previous track action
                    });
                    navigator.mediaSession.setActionHandler('nexttrack', () => {
                        // Handle next track action
                    });
                }
            });
    }

    function processAudioBuffer(data: Buffer) {
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
    }

    async function playPreviousSong() {
        const previousSongInQueue: Song = await QueueService.getPreviousSongInQueue()
        if (!previousSongInQueue) {
            return;
        }

        QueueService.transitionCurrentSong(previousSongInQueue.id).then(() => {
            setCurrentlyPlayingSong(previousSongInQueue);
        })
            .catch((err) => {
                window.alert(`Fatal error: ${JSON.stringify(err, null, 2)}`)
            });
    }

    async function playNextSong() {
        const [nextSongInQueue]: [Song, void] = await Promise.all([QueueService.getNextSongInQueue(), StatService.addSongPlay(currentlyPlayingSong.id)]);

        if (!nextSongInQueue) {
            return;
        }

        QueueService.transitionCurrentSong(nextSongInQueue.id).then(() => {
            setCurrentlyPlayingSong(nextSongInQueue);
        })
            .catch((err) => {
                window.alert(`Fatal error: ${JSON.stringify(err, null, 2)}`)
            });
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
                <PButton label='Previous Song'
                    displayLabel={false}
                    onClick={playPreviousSong}
                    icon={Icons.REWIND}
                    iconType='borderless'
                    iconSize='medium'
                />
                <PButton label='Repeat'
                    displayLabel={false}
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
                    fill={shuffled ? '#B7E1CC' : undefined}
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
                <PButton label='Next Song'
                    displayLabel={false}
                    onClick={playNextSong}
                    icon={Icons.FAST_FORWARD}
                    iconType='borderless'
                    iconSize='medium'
                />
            </div>
        }
    </div>
}

export default Player;