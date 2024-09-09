import React, { useEffect, useState } from "react";
import ViewContainer from "../global/viewContainer";
import { Artist } from "../../../core/db/dbEntities/artist";
import { ElectronUtil } from "../util/electronUtil";
import { Album } from "../../../core/db/dbEntities/album";
import AlbumsForArtists from "./albumsForArtists";
import PButton from "../global/widgets/pButton";
import { Icons } from "../../../core/assets/icons";

export interface ArtistDetailsProps {
    artist: Artist,
    closeArtistDetails: () => void;
}

function ArtistDetails(props: ArtistDetailsProps) {
    const { artist, closeArtistDetails } = props;
    const [albums, setAlbums] = useState<Album[] | undefined>();

    useEffect(() => {
        ElectronUtil.invoke('getAlbumsForArtist', artist.id).then((albums: Album[]) => {
            setAlbums(albums);
        });
    }, [])

    return <ViewContainer>
        <div className='p-col p-row-flex-start p-row-align-stretch'>
            <h1>
                {artist.name}
            </h1>
            <PButton onClick={() => closeArtistDetails()} label="Back" icon={Icons.BACK_ARROW}/>
            {
                albums && albums.length > 0 &&
                <AlbumsForArtists artist={artist} albums={albums}></AlbumsForArtists>
            }
        </div>
    </ViewContainer>
}

export default ArtistDetails;