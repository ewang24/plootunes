import React, { useEffect, useState } from 'react';
import { ArtistService } from './electronServices/artistService';
import { Artist } from '../../../core/db/dbEntities/artist';
import '../../styles/artists/artistsList.scss'
import { AlbumService } from '../albums/electronServices/albumService';
import { Album } from '../../../core/db/dbEntities/album';
import ViewContainer from '../global/viewContainer';
import ArtistTile from './artistTile';

export interface ArtistWithAlbumCovers extends Artist{
    covers: string[];
}

const ArtistList = () => {

    const [artists, setArtists] = useState<ArtistWithAlbumCovers[] | undefined>();

    useEffect(() => {
       fetchArtistData(); 
    }, []);

    async function fetchArtistData(): Promise<void>{
        const [artists, albums]: [artist: Artist[], albums: Album[]] = await Promise.all([ArtistService.getArtists(), AlbumService.getAlbums()]);

        
        const artistToCoversMap = albums.reduce((accumulator, album) => {
            accumulator[album.artistId] = accumulator[album.artistId] || [];
            if(album.coverImage){
                accumulator[album.artistId].push(album.coverImage);
            }
            return accumulator;
        }, {} as {[key: string]: string[]});

        setArtists(artists.map((artist) => {
            return {
                ...artist,
                covers: artistToCoversMap[artist.id]
            }
        }));
    }

    return <>
        <ViewContainer>
            <h1 className='album-list-title'>All Artists</h1>
            {
                artists && artists.length > 0 &&
                <div className={'artist-wrap-container'}>
                    {
                        artists.map((artist: ArtistWithAlbumCovers, index: number) => {
                            return <ArtistTile artist={artist} index={index}></ArtistTile>
                        })
                    }
                </div>
            }
        </ViewContainer>
    </>
}

export default ArtistList;