import React, { useContext, useEffect, useState } from "react";
import { Button, Page, Tab } from "@ploot/pds";
import { Artist } from "../../../core/db/dbEntities/artist";
import { ElectronUtil } from "../util/electronUtil";
import { Album } from "../../../core/db/dbEntities/album";
import AlbumsForArtists from "./albumsForArtists";
import { QueueService } from "../albums/electronServices/queueService";
import { PlayerContext } from "../main";
import SongsForArtist from "./songsForArtist";

export interface ArtistDetailsProps {
  artist: Artist;
  closeArtistDetails: () => void;
}

function ArtistDetails({ artist, closeArtistDetails }: ArtistDetailsProps) {
  const { setCurrentlyPlayingSong, currentlyPlayingSong } = useContext(PlayerContext);
  const [albums, setAlbums] = useState<Album[] | undefined>();

  useEffect(() => {
    ElectronUtil.invoke('getAlbumsForArtist', artist.id).then((albums: Album[]) => setAlbums(albums));
  }, []);

  return <Page
    title={artist.name}
    headerWidgets={<Button icon='backArrow' variant='ghost' onClick={closeArtistDetails} title='Back' />}
  >
    <Tab
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
