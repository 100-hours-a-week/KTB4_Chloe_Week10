import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './AppLayout.css';

// 레이아웃 라우트로 한 번만 마운트된다(App.jsx) — 페이지 전환에도 Sidebar 인스턴스가
// 유지되어 접힘 상태가 보존된다. Login/Signup은 이 레이아웃 바깥의 독립 라우트로 둔다.
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
        </div>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
