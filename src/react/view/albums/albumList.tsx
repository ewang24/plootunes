import React, { ReactElement, useEffect, useState } from 'react';
import { Album } from '../../../../global/dbEntities/album';
import ViewContainer from '../global/viewContainer';
import '../../styles/albums/albumsList.scss'
import '../../assets/img/test.jpg'
import '../../assets/img/up.jpg'
import SongsForAlbum from './songsForAlbum';
import OverlayView from '../global/overlayView';

const AlbumList = () => {

  const [albums, setAlbums] = useState<Album[] | undefined>();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | undefined>();

  useEffect(() => {
    (window as any).electron.ipcRenderer.invoke('fetchAlbums')
      .then((albums: Album[]) => {
        setAlbums(albums);
      });
  }, [])

  function renderAlbumList(): ReactElement {
    return <div className='albums-wrap-container'>
      {albums.map((album: Album, index) => {
        return <div key={index} className='child' onClick={() => setSelectedAlbum(album)}>
          <div className='child-image'>
            {index % 2 === 0 &&
              <img
                src='../../assets/img/test.jpg'
              />
            }
            {index % 2 !== 0 &&
              <img
                src='../../assets/img/up.jpg'
              />
            }
          </div>
          <span className='album-name'>{album.name}</span>
          <span className='artist-name'>{`${album.artistName}`}</span>
        </div>
      })}
    </div>
  }

  function closeSongsForAlbumView() {
    setSelectedAlbum(undefined);
  }

  return (
    <>
      {/* This is the album list */}
      <ViewContainer>
        <h1 className='album-list-title'>Your Albums</h1>
        {albums && albums.length > 0 &&
          renderAlbumList()
        }
      </ViewContainer>
      {
        selectedAlbum && <OverlayView>
          <SongsForAlbum album={selectedAlbum} closeSongsForAlbumView={closeSongsForAlbumView} />
        </OverlayView>
      }
    </>
  );
};

export default AlbumList;
