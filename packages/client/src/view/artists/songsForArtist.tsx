import React, { useEffect, useState } from "react";
import type { ArtistDTO, SongDTO } from "@ploot/plootunes-shared";
import SongsGrid from "../global/widgets/songsGrid";
import { SongService } from "../../services/songService.ts";

export interface SongsForArtistProps {
    artist: ArtistDTO;
}

function SongsForArtist({ artist }: SongsForArtistProps) {
    const [songs, setSongs] = useState<SongDTO[] | undefined>();

    useEffect(() => {
        SongService.getSongsByArtist(artist.id).then((songs: SongDTO[]) => setSongs(songs));
    }, []);

    return songs
        ? <SongsGrid displayAlbumInfo songs={songs} onPlay={() => {}} onQueue={() => {}} />
        : null;
}

export default SongsForArtist;
