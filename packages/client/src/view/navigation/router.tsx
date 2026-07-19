import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { PDS } from '@ploot/pds';
import type { NavItem } from '@ploot/pds';
import AlbumList from '../albums/albumList';
import SongsList from '../songs/songs';
import Landing from '../landing/landing';
import ArtistList from '../artists/artistsList';
import QueueViewer from '../queue/queueViewer';

type RouteLeaf = { path: string };

const navItems: NavItem<RouteLeaf>[] = [
  { id: 'home',    name: 'Home',    icon: 'house',       leaf: { path: '/home' } },
  { id: 'albums',  name: 'Albums',  icon: 'album',       leaf: { path: '/albums' } },
  { id: 'songs',   name: 'Songs',   icon: 'musicNotes',  leaf: { path: '/songs' } },
  { id: 'artists', name: 'Artists', icon: 'microphone',  leaf: { path: '/artists' } },
];

const AppRouter = () => (
  <PDS
    navItems={navItems}
    renderNavItem={(data, name) => <Link to={data.path}>{name}</Link>}
  >
    <div className='p-row p-row-align-stretch router-content'>
      <div className='router-routes'>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/home' element={<Landing />} />
          <Route path='/albums' element={<AlbumList />} />
          <Route path='/songs' element={<SongsList />} />
          <Route path='/artists' element={<ArtistList />} />
        </Routes>
      </div>
      <QueueViewer />
    </div>
  </PDS>
);

export default AppRouter;
