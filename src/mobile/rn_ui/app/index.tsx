import { ExpoSqliteConnectorFactory } from "@/db/expoSqliteConnectorFactory";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ArtistDto } from "../../../core/db/dto/artistDto";
import { Artist } from "../../../core/db/dbEntities/artist";

export default function Index() {

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
          return <Text>{artist.name}</Text>
        })
      }
    </View>
  );
}
