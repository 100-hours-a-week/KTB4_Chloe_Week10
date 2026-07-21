import { Link, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import request from '../../api/request';
import './LoginPage.css';

// 원본: Page/Login/Login.js — 로그인 API 호출 + 이동 담당(입력/검증은 LoginForm 소관)
async function login(credentials) {
  return request('/auth/login', 'POST', credentials);
}

function LoginPage() {
  const navigate = useNavigate();

  async function handleLogin(credentials) {
    try {
      await login(credentials);
      // TODO(0단계 후속): useAuth(AuthContext) 도입 시 accessToken 저장을 여기서 처리
      // 원본은 response.data.link로 하드 리다이렉트했으나, SPA 전환 후엔 board 라우트로 고정 이동
      navigate('/board');
    } catch (error) {
      // 원본 Login.js도 로그인 실패 시 필드별 에러 매핑 없이 console.error만 함(401 alert는 request.js가 처리)
      console.error(error);
    }
  }

  return (
    <>
      <header className="site-header">
        <h1 className="site-title">FitMate</h1>
      </header>
      <main className="main-content">
        <section className="login-section">
          <div className="login-card">
            <h2 className="login-title">로그인</h2>
            <p className="login-subtitle">다시 만나서 반가워요</p>

            <LoginForm onSubmit={handleLogin} />

            <div className="signup-wrap">
              <span className="signup-text">계정이 없으신가요?</span>
              <Link to="/signup" className="btn-signup">
                회원가입
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default LoginPage;
