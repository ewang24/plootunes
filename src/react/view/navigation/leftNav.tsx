import React from 'react';
import { Link } from 'react-router-dom';
import { NavItem } from './router';

const LeftNav: React.FC<{items: NavItem[]}> = ({ items }) => {
  return <div className='p-col p-row-flex-start p-row-align-top'>
    {items.map(({path, name}) =>
      <Link to = {path}>{name}</Link>
    )}
  </div>;
};

export default LeftNav;
