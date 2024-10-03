import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Artist } from "../../../../core/db/dbEntities/artist";
import { ExpoSqliteConnectorFactory } from "@/db/expoSqliteConnectorFactory";
import { ArtistDto } from "../../../../core/db/dto/artistDto";

function Songs(){
    const [artists, setArtists] = useState<Artist[] | undefined>();

    useEffect(() => {
      async function dbTest(){
        let fac = new ExpoSqliteConnectorFactory();
        let conn = await fac.createConnector();
  
        let artistDto = new ArtistDto(conn);
  
        let artists = await artistDto.getArtists();
        setArtists(artists);
      }
      
      dbTest();
    },[]);
  
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {
          artists && artists.map((artist) =>{
            return <Text key = {artist.id}>{artist.name}</Text>
          })
        }
      </View>
    );
}

export default Songs;