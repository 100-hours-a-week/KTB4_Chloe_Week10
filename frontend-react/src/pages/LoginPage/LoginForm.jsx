import { useState } from 'react';
import ValidatedField from '../../components/ValidatedField/ValidatedField';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import './LoginForm.css';

function LoginForm({ onSubmit }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });

  const canSubmit = isValidEmail(values.email) && isValidPassword(values.password);

  function handleEmailInput(value) {
    setValues((prev) => ({ ...prev, email: value }));
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

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ email: values.email, password: values.password });
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
        onChange={handleEmailInput}
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
