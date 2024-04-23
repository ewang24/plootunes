import React, { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AlbumList from '../albums/albumList';
import SongsList from '../songs/songs';
import LeftNav from './leftNav';
import Landing from '../landing/landing';
import '../../styles/navigation/router.scss'

interface AppRoutes {
    path: string,
    element: ReactElement
}

export interface NavItem {
    path: string;
    element: JSX.Element;
    name: string
}

const AppRouter = () => {
    const routes: NavItem[] = [
        { path: '/home', element: <Landing />, name: "Home" },
        { path: '/albums', element: <AlbumList />, name: "Albums" },
        { path: '/songs', element: <SongsList />, name: "Songs" },
    ];

    return <MemoryRouter>
        <div className='p-router-row'>
            <div className='p-row p-row-align-stretch'>
                <LeftNav items = {routes}/>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    {routes.map(({ path, element }) => (
                        <Route key={path} path={path} element={element} />
                    ))}
                </Routes>
            </div>
        </div>
    </MemoryRouter>
};

export default AppRouter;