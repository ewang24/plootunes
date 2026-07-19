import React, { useEffect, useState } from "react";
import { Artist } from "../../../core/db/dbEntities/artist";
import { SongWithAlbum } from "../../../core/db/dbEntities/song";
import SongsGrid from "../global/widgets/songsGrid";
import { SongService } from "../songs/electronServices/songService";

export interface SongsForArtistProps {
    artist: Artist;
}

function SongsForArtist({ artist }: SongsForArtistProps) {
    const [songs, setSongs] = useState<SongWithAlbum[] | undefined>();

    useEffect(() => {
        SongService.getSongsByArtist(artist.id).then((songs: SongWithAlbum[]) => setSongs(songs));
    }, []);

    return songs
        ? <SongsGrid displayAlbumInfo songs={songs} onPlay={() => {}} onQueue={() => {}} />
        : null;
}

export default SongsForArtist;
