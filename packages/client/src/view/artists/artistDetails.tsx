import React, { useContext, useEffect, useState } from "react";
import { Button, Page, Tab } from "@ploot/pds";
import type { ArtistDTO, AlbumDTO } from "@ploot/plootunes-shared";
import AlbumsForArtists from "./albumsForArtists";
import { AlbumService } from "../../services/albumService.ts";
import { PlayerContext } from "../main";
import SongsForArtist from "./songsForArtist";

export interface ArtistDetailsProps {
  artist: ArtistDTO;
  closeArtistDetails: () => void;
}

function ArtistDetails({ artist, closeArtistDetails }: ArtistDetailsProps) {
  const { setCurrentlyPlayingSong, currentlyPlayingSong } = useContext(PlayerContext)!;
  const [albums, setAlbums] = useState<AlbumDTO[] | undefined>();

  useEffect(() => {
    AlbumService.getAlbumsByArtist(artist.id).then((albums: AlbumDTO[]) => setAlbums(albums));
  }, []);

  return <Page
    title={artist.name}
    headerWidgets={<Button icon='arrowLeft' variant='ghost' onClick={closeArtistDetails} title='Back' />}
  >
    <Tab
      initialSelectedTab='albums'
      items={[
        {
          id: 'albums',
          name: 'Albums',
          content: <div className='p-col p-row-flex-start p-row-align-stretch'>
            {albums && albums.length > 0 && <AlbumsForArtists artist={artist} albums={albums} />}
          </div>
        },
        {
          id: 'songs',
          name: 'Songs',
          content: <SongsForArtist artist={artist} />
        },
      ]}
    />
  </Page>;
}

export default ArtistDetails;
