import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Page } from '@ploot/pds';
import '../../styles/albums/albumsList.scss'
import '../../assets/img/test.jpg'
import '../../assets/img/up.jpg'
import SongsForAlbum from './songsForAlbum';
import OverlayView from '../global/overlayView';
import { Album } from '../../../core/db/dbEntities/album';
import { AlbumService } from './electronServices/albumService';

const AlbumList = () => {
  const [albums, setAlbums] = useState<Album[] | undefined>();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | undefined>();

  useEffect(() => {
    AlbumService.getAlbums().then((albums: Album[]) => setAlbums(albums));
  }, []);

  const handleAlbumSelection = useCallback((album: Album) => setSelectedAlbum(album), []);

  function renderAlbumTile(index: number) {
    const album = albums[index];
    return <div key={index} className='p-tile p-tile-small' onClick={() => handleAlbumSelection(album)}>
      <div className='p-tile-image'>
        {album.coverImage
          ? <img draggable="false" src={`http://localhost:3030/${album.coverImage}`} />
          : <img draggable="false" src={index % 2 === 0 ? '../../assets/img/test.jpg' : '../../assets/img/up.jpg'} />
        }
      </div>
      <span className='album-name'>{album.name}</span>
      <span className='artist-name'>{album.artistName}</span>
    </div>;
  }

  function renderAlbumList(): ReactElement {
    return <div className='albums-wrap-container'>
      {albums.map((_, index) => renderAlbumTile(index))}
    </div>;
  }

  return <>
    <Page title='Your Albums'>
      {albums && albums.length > 0 && renderAlbumList()}
    </Page>
    {selectedAlbum &&
      <OverlayView>
        <SongsForAlbum album={selectedAlbum} closeSongsForAlbumView={() => setSelectedAlbum(undefined)} />
      </OverlayView>
    }
  </>;
};

export default AlbumList;
