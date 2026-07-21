import React, { useContext, useEffect, useState } from "react";
import type { ArtistDTO, SongDTO } from "@ploot/plootunes-shared";
import SongsGrid from "../global/widgets/songsGrid";
import { SongService } from "../../services/songService.ts";
import { QueueService } from "../../services/queueService.ts";
import { PlayerContext } from "../main";

export interface SongsForArtistProps {
    artist: ArtistDTO;
}

function SongsForArtist({ artist }: SongsForArtistProps) {
    const { queueSong, setCurrentlyPlayingSong, setShuffled } = useContext(PlayerContext)!;
    const [songs, setSongs] = useState<SongDTO[] | undefined>();

    useEffect(() => {
        SongService.getSongsByArtist(artist.id).then((songs: SongDTO[]) => setSongs(songs));
    }, []);

    function onPlayCallback(song: SongDTO) {
        QueueService.queueAllSongsAndPlay(song.id).then(() => {
            setCurrentlyPlayingSong(song);
            setShuffled(false);
        });
    }

    return songs
        ? <SongsGrid displayAlbumInfo songs={songs} onPlay={onPlayCallback} onQueue={queueSong} />
        : null;
}

export default SongsForArtist;
