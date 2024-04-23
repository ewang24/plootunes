import React, { useState } from 'react';
import '../styles/global.scss'
import LeftNav from './navigation/leftNav';
import AlbumList from './albums/albumList';
import ViewContainer from './global/viewContainer';
import AppRouter from './navigation/router';

const Home = () => {
  return <AppRouter/>;
};

export default Home;
