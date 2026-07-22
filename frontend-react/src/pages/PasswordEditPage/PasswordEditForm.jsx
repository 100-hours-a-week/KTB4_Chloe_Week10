import { useState } from 'react';
import ValidatedField from '../../components/ValidatedField/ValidatedField';
import { isValidPassword } from '../../utils/validators';
import './PasswordEditForm.css';

const PASSWORD_STRENGTH_MSG =
  '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
const PASSWORD_MISMATCH_MSG = '비밀번호가 일치하지 않습니다.';

// 원본: Page/Password_edit/password_edit.js:30-81
// SignupForm.jsx의 getConfirmPasswordError와 동일한 방식 — 두 blur 핸들러가 강도체크/일치체크를
// 각자 순서대로 덮어써서 생기던 원본류 버그를 else-if 우선순위로 재현하지 않음.
function getConfirmPasswordError(confirmPassword, password) {
  if (!isValidPassword(confirmPassword)) return PASSWORD_STRENGTH_MSG;
  if (confirmPassword !== password) return PASSWORD_MISMATCH_MSG;
  return '';
}

// API 호출은 PasswordEditPage 소관 — 이 컴포넌트는 입력값·검증만 담당하고 onSubmit(values)로 위임.
function PasswordEditForm({ onSubmit }) {
  const [values, setValues] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });

  const canSubmit =
    isValidPassword(values.password) &&
    isValidPassword(values.confirmPassword) &&
    values.password === values.confirmPassword;

  // 원본 passwordInput blur(password_edit.js:30-60) — 확인란은 값이 있을 때만 일치 검사
  function handlePasswordBlur() {
    setErrors((prev) => ({
      ...prev,
      password: isValidPassword(values.password) ? '' : PASSWORD_STRENGTH_MSG,
      confirmPassword:
        values.confirmPassword && values.password !== values.confirmPassword ? PASSWORD_MISMATCH_MSG : '',
    }));
  }

  // 원본 confirmPasswordInput blur(password_edit.js:62-81)
  function handleConfirmPasswordBlur() {
    setErrors((prev) => ({
      ...prev,
      confirmPassword: getConfirmPasswordError(values.confirmPassword, values.password),
    }));
  }

  // 원본 editPasswordBtn 핸들러(password_edit.js:105-120) — 성공 시에만 입력값 초기화(실패 시 값 보존)
  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await onSubmit(values);
      setValues({ password: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form className="edit-section" onSubmit={handleSubmit}>
      <h2 className="edit-title">비밀번호 수정</h2>

      <div className="form-card">
        <ValidatedField
          id="password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={values.password}
          error={errors.password}
          onChange={(v) => setValues((prev) => ({ ...prev, password: v }))}
          onBlur={handlePasswordBlur}
        />

        <ValidatedField
          id="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 한번 더 입력하세요"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={(v) => setValues((prev) => ({ ...prev, confirmPassword: v }))}
          onBlur={handleConfirmPasswordBlur}
        />

        <button type="submit" className={`btn-submit${canSubmit ? ' active' : ''}`} disabled={!canSubmit}>
          수정하기
        </button>
      </div>
    </form>
  );
}

export default PasswordEditForm;
