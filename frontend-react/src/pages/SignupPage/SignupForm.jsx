import { useMemo, useState } from 'react';
import ValidatedField from '../../components/ValidatedField/ValidatedField';
import ProfileImageUploader from '../../components/ProfileImageUploader/ProfileImageUploader';
import { isValidEmail, isValidPassword, getNicknameError } from '../../utils/validators';
import './SignupForm.css';

const PASSWORD_STRENGTH_MSG =
  '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
const PASSWORD_MISMATCH_MSG = '비밀번호가 일치하지 않습니다.';
const PROFILE_REQUIRED_MSG = '프로필 사진을 추가해주세요.';

function getConfirmPasswordError(confirmPassword, password) {
  if (!isValidPassword(confirmPassword)) return PASSWORD_STRENGTH_MSG;
  if (confirmPassword !== password) return PASSWORD_MISMATCH_MSG;
  return '';
}

function SignupForm({ onSubmit, serverErrors }) {
  const [values, setValues] = useState({ email: '', password: '', confirmPassword: '', nickname: '' });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    profile: PROFILE_REQUIRED_MSG,
  });
  const [profileFile, setProfileFile] = useState(null);

  const [prevServerErrors, setPrevServerErrors] = useState(serverErrors);

  if (serverErrors && serverErrors !== prevServerErrors) {
    setPrevServerErrors(serverErrors);
    setErrors((prev) => ({ ...prev, ...serverErrors }));
  }

  const profilePreviewUrl = useMemo(
    () => (profileFile ? URL.createObjectURL(profileFile) : ''),
    [profileFile]
  );

  const canSubmit =
    isValidEmail(values.email) &&
    isValidPassword(values.password) &&
    isValidPassword(values.confirmPassword) &&
    values.password === values.confirmPassword &&
    !getNicknameError(values.nickname) &&
    profileFile !== null;

  function handleProfileChange(e) {
    const file = e.target.files[0];
    if (!file) {
      setProfileFile(null);
      setErrors((prev) => ({ ...prev, profile: PROFILE_REQUIRED_MSG }));
      return;
    }
    setProfileFile(file);
    setErrors((prev) => ({ ...prev, profile: '' }));
  }

  function handleEmailBlur() {
    setErrors((prev) => ({
      ...prev,
      email: isValidEmail(values.email) ? '' : '유효한 이메일 주소를 입력해주세요.',
    }));
  }

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

  function handleNicknameBlur() {
    setErrors((prev) => ({ ...prev, nickname: getNicknameError(values.nickname) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ email: values.email, password: values.password, nickname: values.nickname, profileFile });
  }

  return (
    <form className="form-area" onSubmit={handleSubmit}>
      <ProfileImageUploader
        previewUrl={profilePreviewUrl}
        onFileChange={handleProfileChange}
        error={errors.profile}
      />

      <ValidatedField
        id="email"
        label="이메일"
        type="email"
        required
        placeholder="이메일을 입력하세요"
        value={values.email}
        error={errors.email}
        onChange={(v) => setValues((prev) => ({ ...prev, email: v }))}
        onBlur={handleEmailBlur}
      />
      <ValidatedField
        id="password"
        label="비밀번호"
        type="password"
        required
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
        required
        placeholder="비밀번호를 한번 더 입력하세요"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(v) => setValues((prev) => ({ ...prev, confirmPassword: v }))}
        onBlur={handleConfirmPasswordBlur}
      />
      <ValidatedField
        id="nickname"
        label="닉네임"
        required
        placeholder="닉네임을 입력하세요"
        maxLength={10}
        value={values.nickname}
        error={errors.nickname}
        onChange={(v) => setValues((prev) => ({ ...prev, nickname: v }))}
        onBlur={handleNicknameBlur}
      />

      <button type="submit" className={`btn-submit${canSubmit ? ' active' : ''}`} disabled={!canSubmit}>
        회원가입
      </button>
    </form>
  );
}

export default SignupForm;
