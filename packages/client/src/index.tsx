import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '@ploot/pds/styles';
import Main from './view/main';
import { AuthCallback } from './modules/auth/AuthCallback';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/auth/callback' element={<AuthCallback />} />
      <Route path='/*' element={<Main />} />
    </Routes>
  </BrowserRouter>
);
