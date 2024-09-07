import React, { ReactElement, useEffect, useState } from 'react';
import { Artist } from '../../../core/db/dbEntities/artist';
import OverlayView from '../global/overlayView';
import ArtistDetails from './artistDetails';

export interface ArtistTileProps {
    artist: Artist;
    index: number;
}

function ArtistTile(props: ArtistTileProps) {
    const { artist, index } = props;
    const [displayArtistAlbumsList, setDisplayArtistAlbumsList] = useState(false);

    function showArtistDetails(){
        setDisplayArtistAlbumsList(true);
    }

    function hideArtistDetails(){
        setDisplayArtistAlbumsList(false);
    }

    return <>
        <div className={'artist-tile p-tile'} onClick={showArtistDetails}>
            <div className='p-tile-image'>
                {index % 2 === 0 &&
                    <img
                        src='../../assets/img/up.jpg'
                    />
                }
                {index % 2 !== 0 &&
                    <img
                        src='../../assets/img/test.jpg'
                    />
                }
            </div>
            <strong className='artist-name'>
                {artist.name}
            </strong>
        </div>
        {displayArtistAlbumsList && 
            <OverlayView>
                <ArtistDetails artist={artist} closeArtistDetails={hideArtistDetails}></ArtistDetails>
            </OverlayView>
        }
    </>
};

export default ArtistTile;