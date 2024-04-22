import React, { useState } from 'react';

const Home = () => {

  const [data, setData] = useState(null);
  function test() {
    (window as any).electron.ipcRenderer.invoke('fetchSongs')
      .then((dataPromise) => {
    
        setData(dataPromise);
    });
  }

  return (
    <div>
      <h1>Hello, World!</h1>
      <p>This is a simple React component.</p>
      <button onClick={test}>fetch data</button>
      {data && <p>Data from the main process: {data}</p>}
    </div>
  );
};

export default Home;
