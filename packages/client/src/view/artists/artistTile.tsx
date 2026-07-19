import React, { ReactElement, useState } from 'react';
import OverlayView from '../global/overlayView';
import ArtistDetails from './artistDetails';
import { ArtistWithAlbumCovers } from './artistsList';

export interface ArtistTileProps {
    artist: ArtistWithAlbumCovers;
    index: number;
}

function ArtistTile(props: ArtistTileProps) {
    const { artist, index } = props;
    const [displayArtistAlbumsList, setDisplayArtistAlbumsList] = useState(false);

    function showArtistDetails() {
        setDisplayArtistAlbumsList(true);
    }

    function hideArtistDetails() {
        setDisplayArtistAlbumsList(false);
    }

    function renderImageTile(): ReactElement {
        if (!artist.covers.length) {
            return <div className='p-tile-image'>
                {index % 2 === 0 &&
                    <img draggable="false"
                        src='../../assets/img/up.jpg'
                    />
                }
                {index % 2 !== 0 &&
                    <img draggable="false"
                        src='../../assets/img/test.jpg'
                    />
                }
            </div>
        }

        return <div className='p-tile-stacked-row'>
            {artist.covers.map((cover) => {
                return <div className='p-tile-image' key = {cover}>
                    <img draggable="false"
                        src= {`http://localhost:3030/${cover}`}
                    />
                </div>
            })}
        </div>
    }

    return <>
        <div className={`artist-tile p-tile p-tile-medium ${artist.covers?.length? 'stacked': ''}`} onClick={showArtistDetails}>
            {renderImageTile()}
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