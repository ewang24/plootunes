import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';

function App() {



    let [fileList, setFileList] = useState('');
    window.electron.ipcRenderer.invoke('getFiles', 'P:\\Music\\music\\rotation\\Aether\\Tale of Fire')
        .then((fileList) => {
            setFileList(fileList);
        });


  return (
    <div className="App">
      files go here:
      {fileList}
    </div>
  );
}

export default App;
