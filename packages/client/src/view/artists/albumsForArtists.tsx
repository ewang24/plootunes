import React, { useState } from "react";
import type { AlbumDTO, ArtistDTO } from "@ploot/plootunes-shared";
import OverlayView from "../global/overlayView";
import SongsForAlbum from "../albums/songsForAlbum";
import { thumbUrl } from "../../services/covers.ts";
import '../../styles/artists/albumsForArtist.scss'

export interface AlbumsForArtistsProps {
    artist: ArtistDTO;
    albums: AlbumDTO[]
}

function AlbumsForArtists(props: AlbumsForArtistsProps) {
    const { artist, albums } = props;
    const [selectedAlbum, setSelectedAlbum] = useState<AlbumDTO | undefined>();

    function closeSongsForAlbumView() {
        setSelectedAlbum(undefined);
    }

    return <>
        <div className="p-row p-row-flex-start albums-for-artist-container">
            {albums.map((album: AlbumDTO, index: number) => {
                return <div key = {album.id} className='p-tile p-tile-medium' onClick={() => setSelectedAlbum(album)}>
                    <div className='p-tile-image'>
                        {album.coverImage &&
                            <img draggable="false"
                                src={thumbUrl(album.coverImage)}
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