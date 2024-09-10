import React, { useState } from "react";
import { Album } from "../../../core/db/dbEntities/album";
import { Artist } from "../../../core/db/dbEntities/artist";
import OverlayView from "../global/overlayView";
import SongsForAlbum from "../albums/songsForAlbum";

export interface AlbumsForArtistsProps {
    artist: Artist;
    albums: Album[]
}

function AlbumsForArtists(props: AlbumsForArtistsProps) {
    const { artist, albums } = props;
    const [selectedAlbum, setSelectedAlbum] = useState<Album | undefined>();

    function closeSongsForAlbumView() {
        setSelectedAlbum(undefined);
    }

    return <>
        <div className="p-col p-row-align-top">
            {albums.map((album: Album, index: number) => {
                return <div className='p-tile' onClick={() => setSelectedAlbum(album)}>
                    <div className='p-tile-image'>
                        {index % 2 === 0 &&
                            <img draggable = "false"
                                src='../../assets/img/test.jpg'
                            />
                        }
                        {index % 2 !== 0 &&
                            <img draggable = "false"
                                src='../../assets/img/up.jpg'
                            />
                        }
                    </div>
                    <strong>
                        {album.name}
                    </strong>
                </div>
            })}
        </div>
        {
            selectedAlbum && <OverlayView>
                <SongsForAlbum album={selectedAlbum} closeSongsForAlbumView={closeSongsForAlbumView}></SongsForAlbum>
            </OverlayView>
        }
    </>
}

export default AlbumsForArtists;