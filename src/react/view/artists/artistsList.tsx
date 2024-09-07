import React, { useEffect, useState } from 'react';
import { ArtistService } from './electronServices/artistService';
import { Artist } from '../../../core/db/dbEntities/artist';
import ArtistTile from './artistTile';

const ArtistList = () => {

    const [artists, setArtists] = useState<Artist[] | undefined>();

    useEffect(() => {
        ArtistService.getArtists().then((artists: Artist[]) => {
            setArtists(artists);
        });
    }, [])

    return <>
        {
            artists && artists.length > 0 &&
            <>
                {
                    artists.map((artist => {
                        return <ArtistTile {...artist}></ArtistTile>
                    }))
                }
            </>
        }
    </>
}

export default ArtistList;