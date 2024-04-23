import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AlbumList from '../albums/albumList';
import SongsList from '../songs/songs';
import LeftNav from './leftNav';
const AppRouter = () => {
    return <MemoryRouter>
        <div className='p-row'>
            <LeftNav />
            <Routes>
                <Route path='/' element={<AlbumList />} />
                <Route path='/albums' element={<AlbumList />} />
                <Route path='/songs' element={<SongsList />} />
            </Routes>
        </div>
    </MemoryRouter>
};

export default AppRouter;