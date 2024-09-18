import { useEffect, useState } from "react";
import { Artist } from "../../../core/db/dbEntities/artist";
import { SongService } from "../songs/electronServices/songService";
import { Song } from "../../../core/db/dbEntities/song";
import React from "react";

export interface SongsForArtistProps {
    artist: Artist;
}

function SongsForArtist(props: SongsForArtistProps) {
    const { artist } = props;
    const [songs, setSongs] = useState<Song[] | undefined>();

    useEffect(() => {
        SongService.getSongsByArtist(artist.id).then((songs: Song[]) => {
            setSongs(songs);
        })
    }, []);

    return <div className = 'p-col'>
        {
            songs && 
            <>
                {songs.map((song) => {
                    return <div className = 'p-row'>
                        {song.name}
                    </div>
                })}
            </>
        }
    </div>
}

export default SongsForArtist;