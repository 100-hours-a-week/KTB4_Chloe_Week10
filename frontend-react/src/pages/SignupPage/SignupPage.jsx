import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupForm from './SignupForm';
import request from '../../api/request';
import './SignupPage.css';

async function signUp(formData) {
  return request('/users/signup', 'POST', formData);
}

function SignupPage() {
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState(null);

  async function handleSignup({ email, password, nickname, profileFile }) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('nickname', nickname);
    formData.append('profile_image', profileFile);

    try {
      await signUp(formData);
      navigate('/login');
    } catch (error) {
      if (error.status === 409 && error.field === 'email') {
        setServerErrors({ email: '중복된 이메일 입니다.' });
      } else if (error.status === 409 && error.field === 'nickname') {
        setServerErrors({ nickname: '중복된 닉네임 입니다.' });
      } else {
        console.error(error);
      }
    }
  }

  return (
    <>
      <header className="site-header">
        <Link to="/login" className="btn-back" aria-label="로그인으로 돌아가기">
          ‹
        </Link>
        <h1 className="site-title">FitMate</h1>
      </header>
      <main className="main-content">
        <section className="signup-section">
          <h2 className="signup-title">회원가입</h2>

          <SignupForm onSubmit={handleSignup} serverErrors={serverErrors} />

          <div className="login-link-wrap">
            <Link to="/login" className="login-link">
              로그인하러 가기
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default SignupPage;
