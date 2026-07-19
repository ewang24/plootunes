import React, { useContext, useEffect, useState } from 'react';
import '../../styles/player/player.scss'
import Player from './player';

const PlayerMain = () => {
    return <div className={'player-main'}>
        <Player/>
    </div>
};

export default PlayerMain;