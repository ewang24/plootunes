import React, { useEffect, useState } from 'react';
import { ArtistService } from './electronServices/artistService';
import { Artist } from '../../../core/db/dbEntities/artist';
import ArtistTile from './artistTile';
import '../../styles/artists/artistsList.scss'
import ViewContainer from '../global/viewContainer';

const ArtistList = () => {

    const [artists, setArtists] = useState<Artist[] | undefined>();

    useEffect(() => {
        ArtistService.getArtists().then((artists: Artist[]) => {
            setArtists(artists);
        });
    }, [])

    return <>
        <ViewContainer>
            <h1 className='album-list-title'>All Artists</h1>
            {
                artists && artists.length > 0 &&
                <div className={'artist-wrap-container'}>
                    {
                        artists.map((artist: Artist, index: number) => {
                            return <ArtistTile artist={artist} index={index}></ArtistTile>
                        })
                    }
                </div>
            }
        </ViewContainer>
    </>
}

export default ArtistList;