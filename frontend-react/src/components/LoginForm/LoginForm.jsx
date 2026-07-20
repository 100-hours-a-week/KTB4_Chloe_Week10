import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ValidatedField from '../ValidatedField/ValidatedField';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import request from '../../api/request';
import './LoginForm.css';

// 원본: Page/Login/Login.js — email/password 둘 다 'input' 이벤트에서 실시간 검증(blur 아님)
async function login(credentials) {
  return request('/auth/login', 'POST', credentials);
}

function LoginForm() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  // 버튼 활성화 여부는 별도 isValid* state로 추적하지 않고 매 렌더마다 파생 계산(설계 문서 5절)
  const canSubmit = isValidEmail(values.email) && isValidPassword(values.password);

  function handleEmailInput(value) {
    // 값 저장
    setValues((prev) => ({ ...prev, email: value }));
    // 에러 계산
    setErrors((prev) => ({
      ...prev,
      email: isValidEmail(value) ? '' : '유효한 이메일 주소를 입력해주세요.',
    }));
  }

  function handlePasswordInput(value) {
    setValues((prev) => ({ ...prev, password: value }));
    setErrors((prev) => ({
      ...prev,
      password: isValidPassword(value)
        ? ''
        : '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
    }));
  }

  async function handleSubmit(e) {
    // 브라우저에서는 <form>을 제출하면 기본적으로 페이지를 다시 불러오거나 지정된 주소로 이동하려고 한다.
    // 근데 지금은 API 호출을 기다렸다가 /board로 이동해야하기 때문에, 기본 제출 동작을 막음.
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await login({ email: values.email, password: values.password });
      // TODO(0단계 후속): useAuth(AuthContext) 도입 시 accessToken 저장을 여기서 처리
      // 원본은 result.data.link로 하드 리다이렉트했으나, SPA 전환 후엔 board 라우트로 고정 이동
      navigate('/board');
    } catch (error) {
      // 원본 Login.js도 로그인 실패 시 필드별 에러 매핑 없이 console.error만 함(401 alert는 request.js가 처리)
      console.error(error);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <ValidatedField
        id="email"
        label="이메일"
        type="email"
        placeholder="이메일을 입력하세요"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={handleEmailInput} //값 저장 과 동시에 에러계산도 같이
      />
      <ValidatedField
        id="password"
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력하세요"
        autoComplete="current-password"
        value={values.password}
        error={errors.password}
        onChange={handlePasswordInput}
      />
      <button type="submit" className={`btn-login${canSubmit ? ' active' : ''}`} disabled={!canSubmit}>
        로그인
      </button>
    </form>
  );
}

export default LoginForm;
