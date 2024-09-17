import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import ViewContainer from '../global/viewContainer';
import '../../styles/albums/albumsList.scss'
import '../../assets/img/test.jpg'
import '../../assets/img/up.jpg'
import SongsForAlbum from './songsForAlbum';
import OverlayView from '../global/overlayView';
import { Album } from '../../../core/db/dbEntities/album';
import { AlbumService } from './electronServices/albumService';
import { AutoSizer, List } from 'react-virtualized';

const AlbumList = () => {

  const [albums, setAlbums] = useState<Album[] | undefined>();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | undefined>();

  useEffect(() => {
    AlbumService.getAlbums()
      .then((albums: Album[]) => {
        setAlbums(albums);
      });
  }, []);

  const handleAlbumSelection = useCallback((album: Album) => {
    setSelectedAlbum(album)
  }, [])

  function renderAlbumTile(index: number) {
    const album = albums[index];
    return <div key={index} className='p-tile ' onClick={() => { handleAlbumSelection(album) }}>
      <div className='p-tile-image p-tile-small'>
        <>
          {album.coverImage &&
            <img draggable="false"
              src= {`http://localhost:3030/${album.coverImage}`}
            />
          }
          {!album.coverImage &&
            <>
              {index % 2 === 0 &&
                <img draggable="false"
                  src='../../assets/img/test.jpg'
                />
              }
              {index % 2 !== 0 &&
                <img draggable="false"
                  src='../../assets/img/up.jpg'
                />
              }
            </>
          }
        </>
      </div>
      <span className='album-name'>{album.name}</span>
      <span className='artist-name'>{`${album.artistName}`}</span>
    </div>
  }

  function renderAlbumList(): ReactElement {
    return <div className='albums-wrap-container'>
      {albums.map((album: Album, index) => {
        return renderAlbumTile(index);
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
