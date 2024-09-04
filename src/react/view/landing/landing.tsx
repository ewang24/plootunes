import React, { useEffect, useState } from 'react';

const Landing = () => {

  const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
  useEffect(() => {
    (window as any).electron.ipcRenderer.invoke('getAudioFileData')
      .then((data: Buffer) => {
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
      });
  }, []);

  return <>
    {audioSrc && 
       <audio controls>
       <source src={audioSrc} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    }
    Welcome to the landing
  </>;
};

export default Landing;
