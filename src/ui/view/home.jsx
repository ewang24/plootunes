import { ipcRenderer } from 'electron';
import React from 'react';

const Home = () => {

  function test(){
    ipcRenderer.send('testStuff')
  }

  return (
    <div>
      <h1>Hello, World!</h1>
      <p>This is a simple React component.</p>
      <button></button>
    </div>
  );
};

export default Home;
