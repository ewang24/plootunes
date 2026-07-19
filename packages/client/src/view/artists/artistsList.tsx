import React, { useEffect, useState } from 'react';
import { Page } from '@ploot/pds';
import { ArtistService } from './electronServices/artistService';
import { Artist } from '../../../core/db/dbEntities/artist';
import '../../styles/artists/artistsList.scss'
import { AlbumService } from '../albums/electronServices/albumService';
import { Album } from '../../../core/db/dbEntities/album';
import ArtistTile from './artistTile';

export interface ArtistWithAlbumCovers extends Artist {
  covers: string[];
}

const ArtistList = () => {
  const [artists, setArtists] = useState<ArtistWithAlbumCovers[] | undefined>();

  useEffect(() => { fetchArtistData(); }, []);

  async function fetchArtistData(): Promise<void> {
    const [artists, albums]: [Artist[], Album[]] = await Promise.all([ArtistService.getArtists(), AlbumService.getAlbums()]);

    const artistToCoversMap = albums.reduce((acc, album) => {
      acc[album.artistId] = acc[album.artistId] || [];
      if (album.coverImage) acc[album.artistId].push(album.coverImage);
      return acc;
    }, {} as { [key: string]: string[] });

    setArtists(artists.map((artist) => ({ ...artist, covers: artistToCoversMap[artist.id] })));
  }

  return <Page title='All Artists'>
    {artists && artists.length > 0 &&
      <div className='artist-wrap-container'>
        {artists.map((artist, index) => (
          <ArtistTile key={artist.id} artist={artist} index={index} />
        ))}
      </div>
    }
  </Page>;
};

export default ArtistList;
