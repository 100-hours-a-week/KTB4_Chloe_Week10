import { useState } from 'react';
import ValidatedField from '../../components/ValidatedField/ValidatedField';
import { isValidPassword } from '../../utils/validators';
import './PasswordEditForm.css';

const PASSWORD_STRENGTH_MSG =
  '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
const PASSWORD_MISMATCH_MSG = '비밀번호가 일치하지 않습니다.';

function getConfirmPasswordError(confirmPassword, password) {
  if (!isValidPassword(confirmPassword)) return PASSWORD_STRENGTH_MSG;
  if (confirmPassword !== password) return PASSWORD_MISMATCH_MSG;
  return '';
}

function PasswordEditForm({ onSubmit }) {
  const [values, setValues] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });

  const canSubmit =
    isValidPassword(values.password) &&
    isValidPassword(values.confirmPassword) &&
    values.password === values.confirmPassword;

  function handlePasswordBlur() {
    setErrors((prev) => ({
      ...prev,
      password: isValidPassword(values.password) ? '' : PASSWORD_STRENGTH_MSG,
      confirmPassword:
        values.confirmPassword && values.password !== values.confirmPassword ? PASSWORD_MISMATCH_MSG : '',
    }));
  }

  function handleConfirmPasswordBlur() {
    setErrors((prev) => ({
      ...prev,
      confirmPassword: getConfirmPasswordError(values.confirmPassword, values.password),
    }));
  }

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
