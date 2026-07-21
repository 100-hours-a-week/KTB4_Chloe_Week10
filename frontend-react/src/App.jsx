import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout/AppLayout';
import LoginPage from './components/LoginPage/LoginPage';
import SignupPage from './components/SignupPage/SignupPage';

// TODO: 2~5단계에서 실제 페이지 컴포넌트로 교체.
// 지금은 AppLayout의 <Outlet /> 동작(페이지 전환 시 Sidebar 접힘 상태 유지)을
// 눈으로 확인하기 위한 임시 placeholder만 연결한다 — migration-plan.md 0단계 검증 체크리스트 1번.
function PlaceholderPage({ label }) {
  return <p>{label} 페이지 자리 (다음 단계에서 교체 예정)</p>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={<PlaceholderPage label="Board" />} />
          <Route path="/profile-edit" element={<PlaceholderPage label="Profile Edit" />} />
          <Route path="/password-edit" element={<PlaceholderPage label="Password Edit" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
