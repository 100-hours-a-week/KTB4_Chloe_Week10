import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import './AppLayout.css';

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onCollapse={() => setSidebarCollapsed(true)} />

      <div className="content-area">
        <div className="collapsed-topbar" hidden={!sidebarCollapsed}>
          <button
            type="button"
            className="btn-sidebar-toggle"
            aria-label="사이드바 펼치기"
            onClick={() => setSidebarCollapsed(false)}
          >
            <span className="icon-chevron-right">›</span>
          </button>
          <span className="collapsed-logo">FitMate</span>
          <Header variant="topbar" />
        </div>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
