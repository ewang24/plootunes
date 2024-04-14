import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import Home from './ui/home';

function App() {



    let [fileList, setFileList] = useState('');

    useEffect(() =>{
      window.electron.ipcRenderer.invoke('getFiles', 'P:\\Music\\music\\rotation\\Aether\\Tale of Fire')
      .then((fileList) => {
          setFileList(fileList);
      });
    }, [])
    


  return (
    <div className="App">
      <Home/>
      files go here:
      {fileList}
    </div>
  );
}

export default App;
