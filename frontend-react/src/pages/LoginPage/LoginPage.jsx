import { Link, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import request from '../../api/request';
import { useAuth } from '../../context/AuthContext/useAuth';
import './LoginPage.css';

async function login(credentials) {
  return request('/auth/login', 'POST', credentials);
}

function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  async function handleLogin(credentials) {
    try {
      const response = await login(credentials);
      setAuth(response.data.jwtToken.accessToken,response.data.profileImage);
      navigate('/board');
    } catch (error) {
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
