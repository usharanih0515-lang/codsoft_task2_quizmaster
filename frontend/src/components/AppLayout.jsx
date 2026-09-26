import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './AppLayout.css';

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout-main">
        <TopBar />
        <main className="app-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
