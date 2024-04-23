import React, { ReactElement, useEffect, useState } from 'react';
import { Album } from '../../../../global/dbEntities/album';
import ViewContainer from '../global/viewContainer';
import '../../styles/albums/albumsList.scss'
import '../../assets/test.jpg'
import '../../assets/up.jpg'

const AlbumList = () => {

  const [albums, setAlbums] = useState<Album[] | undefined>();
  useEffect(() => {
    (window as any).electron.ipcRenderer.invoke('fetchAlbums')
      .then((albums: Album[]) => {
        console.log(albums);
        setAlbums(albums);
      });
  }, [])

  function renderAlbumList(): ReactElement {
    return <div className='albums-wrap-container'>
      {albums.map((album: Album, index) => {
        return <div key={index} className='child'>
          <div className='child-image'>
            {index % 2 === 0 &&
              <img
                src='../../assets/test.jpg'
              />
            }
            {index % 2 !== 0 &&
              <img
                src='../../assets/up.jpg'
              />
            }
          </div>
          {album.name}
        </div>
      })}
    </div>
  }

  return (
    <ViewContainer>
      <h1>Album List</h1>
      {albums && albums.length > 0 &&
        renderAlbumList()
      }
    </ViewContainer>
  );
};

export default AlbumList;
