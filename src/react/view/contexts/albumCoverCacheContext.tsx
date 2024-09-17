//TODO: just leaving this as an example for now import React, { createContext, ReactElement, useEffect, useState } from "react";
// import { AlbumCoverCache, AlbumService } from "../albums/electronServices/albumService";

// export interface AlbumCoverCacheContextType {
//     albumCoverCache: AlbumCoverCache;
//     setAlbumCoverCache: React.Dispatch<React.SetStateAction<AlbumCoverCache>>;
// }

// export const AlbumCoverCacheContext = createContext<AlbumCoverCacheContextType | undefined>(undefined)

// export const AlbumCoverCacheProvider = ({children}: {children: ReactElement}) =>{
//     const [albumCoverCache, setAlbumCoverCache] = useState<AlbumCoverCache | undefined>();
//     // useEffect(() => {
//     //     if(!albumCoverCache){
//     //         AlbumService.getAlbumsCovers()
//     //         .then((albumsCovers: AlbumCoverCache) => {
//     //           setAlbumCoverCache(albumsCovers);
//     //         });
//     //     }
//     //   }, []);

//     return <AlbumCoverCacheContext.Provider value = {{albumCoverCache, setAlbumCoverCache}}>
//         {children}
//     </AlbumCoverCacheContext.Provider>
// }