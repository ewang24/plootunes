import { useEffect, useState } from "react";
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Button, View } from "react-native";

function Player(){
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const requestPermission = async () => {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) {
        alert('Permission is required to access audio files.');
      }
    };
    requestPermission();

    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const controlSound = async () => {
    if(!isPlaying){
      playSound();
    }
    else{
      stopSound();
    }
  }

  const playSound = async () => {
    console.log('clicked play');
    if (sound) {
      await sound.unloadAsync();
      console.log('unloaded');
    }

    console.log('loading audio');
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: 'file:///storage/emulated/0/Music/Abbath_ToWar_886445634129_1_1.mp3' }, 
      { shouldPlay: true }
    );
    setSound(newSound);
    setIsPlaying(true);
    console.log('loaded');

    newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      console.log('play back status update');
      let successStatus = (status as AVPlaybackStatusSuccess);
      if (!successStatus.isPlaying && successStatus.didJustFinish) {
        setIsPlaying(false);
        console.log(`stopped playing: ${successStatus.uri}`)
        newSound.unloadAsync();
      }
    });
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      // setPosition(0); // Reset position to 0 when stopped
    }
  }

  return (
    <View>
      <Button title= {`${isPlaying? 'Stop': 'Play'} Audio`} onPress={controlSound} />
    </View>
  );
}

export default Player;