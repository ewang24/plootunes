import React, { useState } from "react";
import { Album } from "../../../core/db/dbEntities/album";
import { Artist } from "../../../core/db/dbEntities/artist";
import OverlayView from "../global/overlayView";
import SongsForAlbum from "../albums/songsForAlbum";
import '../../styles/artists/albumsForArtist.scss'

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
        <div className="p-row p-row-flex-start albums-for-artist-container">
            {albums.map((album: Album, index: number) => {
                return <div key = {album.id} className='p-tile p-tile-medium' onClick={() => setSelectedAlbum(album)}>
                    <div className='p-tile-image'>
                        {album.coverImage &&
                            <img draggable="false"
                                src={`http://localhost:3030/${album.coverImage}`}
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