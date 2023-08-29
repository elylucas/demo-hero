import React from 'react';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  
}

const Layout: React.FC<LayoutProps> = () => {
  return (
    <div className="container">
      <h1 className='text-3xl text-blue-500'>
        Demo Hero Actions
        <br />
      </h1>
      <Outlet />
    </div>
  );
};

export default Layout;