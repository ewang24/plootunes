import React, { useState } from 'react';
import '../styles/global.scss'
import '../styles/main.scss'
import AppRouter from './navigation/router';
import PlayerMain from './player/playerMain';

const Main = () => {
  return <div className='main-container'>
    <AppRouter/>
    <PlayerMain/>
  </div>
};

export default Main;
