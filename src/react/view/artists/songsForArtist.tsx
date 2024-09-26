import { useEffect, useState } from "react";
import { Artist } from "../../../core/db/dbEntities/artist";
import { SongService } from "../songs/electronServices/songService";
import { Song, SongWithAlbum } from "../../../core/db/dbEntities/song";
import React from "react";
import SongsGrid from "../global/widgets/songsGrid";

export interface SongsForArtistProps {
    artist: Artist;
}

function SongsForArtist(props: SongsForArtistProps) {
    const { artist } = props;
    const [songs, setSongs] = useState<SongWithAlbum[] | undefined>();

    useEffect(() => {
        SongService.getSongsByArtist(artist.id).then((songs: SongWithAlbum[]) => {
            setSongs(songs);
        })
    }, []);

    return <div className = 'p-main-content'>
        {
            songs && 
            <SongsGrid
                displayAlbumInfo = {true}
                songs={songs}
                onPlay={() => {}}
                onQueue={() => {}}
            />
        }
    </div>
}

export default SongsForArtist;