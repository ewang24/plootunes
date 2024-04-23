import React from 'react';
import { Link } from 'react-router-dom';

const LeftNav = () => {
  return <div className='p-col'>
    <Link to = "/albums">Albums</Link>
    <Link to = "/songs">Albums</Link>
  </div>;
};

export default LeftNav;
