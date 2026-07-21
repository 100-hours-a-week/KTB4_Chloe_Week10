import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupForm from './SignupForm';
import request from '../../api/request';
import './SignupPage.css';

// 원본: Page/Signup/Signup.js — 회원가입 API 호출 + FormData 조립 + 409 에러 필드 매핑 담당(입력/검증은 SignupForm 소관)
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
      // TODO(0단계 후속): useAuth(AuthContext) 도입 시 회원가입 직후 자동 로그인 처리 여부 결정
      await signUp(formData);
      // 원본은 result.data.link로 하드 리다이렉트했으나, SPA 전환 후엔 로그인 라우트로 고정 이동
      navigate('/login');
    } catch (error) {
      // 원본: 409 시 field로 이메일/닉네임 중복 에러만 매핑, 그 외 상태코드는 콘솔 로그만
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
