import React, { useEffect, useState } from 'react';
import { Page } from '@ploot/pds';
import { ArtistService } from '../../services/artistService.ts';
import type { ArtistDTO, AlbumDTO } from '@ploot/plootunes-shared';
import '../../styles/artists/artistsList.scss'
import { AlbumService } from '../../services/albumService.ts';
import ArtistTile from './artistTile';

export interface ArtistWithAlbumCovers extends ArtistDTO {
  covers: string[];
}

const ArtistList = () => {
  const [artists, setArtists] = useState<ArtistWithAlbumCovers[] | undefined>();

  useEffect(() => { fetchArtistData(); }, []);

  async function fetchArtistData(): Promise<void> {
    const [artists, albums]: [ArtistDTO[], AlbumDTO[]] = await Promise.all([ArtistService.getArtists(), AlbumService.getAlbums()]);

    const artistToCoversMap = albums.reduce((acc, album) => {
      if (!album.albumArtistId) return acc;
      acc[album.albumArtistId] = acc[album.albumArtistId] || [];
      if (album.coverImage) acc[album.albumArtistId].push(album.coverImage);
      return acc;
    }, {} as { [key: string]: string[] });

    setArtists(artists.map((artist) => ({ ...artist, covers: artistToCoversMap[artist.id] ?? [] })));
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
