import React, { ReactElement, useEffect, useState } from 'react';
import { Artist } from '../../../core/db/dbEntities/artist';

function ArtistTile(artist: Artist){
    return <>
        <strong>
            {artist.name}
        </strong>
    </>
};

export default ArtistTile;