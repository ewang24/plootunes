import React, { useContext, useEffect, useState } from 'react';
import '../../styles/player/player.scss'
import Player from './player';
import { PlayerContext } from '../main';

const PlayerMain = () => {
    const {isPlaying} = useContext(PlayerContext);
    return <div className={'player-main'}>
        <Player isPlaying = {isPlaying}/>
    </div>
};

export default PlayerMain;