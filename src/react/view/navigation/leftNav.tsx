import React from 'react';
import { Link } from 'react-router-dom';
import { NavItem } from './router';
import '../../styles/navigation/leftNav.scss'
import '../../assets/img/up.jpg'

const LeftNav: React.FC<{ items: NavItem[] }> = ({ items }) => {
  return <div className='p-col p-row-space-between p-row-align-stretch p-left-nav-container'>
    <div className='p-col link-container p-row-align-top'>
      {items.map(({ path, name }) =>
        <Link key={`${path}-${name}`} to={path}>{name}</Link>
      )}
    </div>
    <div className = 'p-col nav-footer'>
      <div className = 'nav-footer-logo'>
        <img src = '../../assets/img/up.jpg'/>
      </div>
    </div>
  </div>;
};

export default LeftNav;
