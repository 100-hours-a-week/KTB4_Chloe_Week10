import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ValidatedField from '../ValidatedField/ValidatedField';
import { isValidEmail, isValidPassword, getNicknameError } from '../../utils/validators';
import request from '../../api/request';
import './SignupForm.css';

const PASSWORD_STRENGTH_MSG =
  '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
const PASSWORD_MISMATCH_MSG = '비밀번호가 일치하지 않습니다.';

// 원본: 비밀번호 확인 검증. 두 blur 핸들러가 강도체크→일치체크를 순차 실행하며 뒤 블록이 앞 블록을
// 무조건 덮어써서, 약한 비밀번호를 같은 값으로 두 번 입력하면 "유효"로 잘못 표시되는 원본 버그가 있었음.
// 여기서는 else-if 우선순위로 재현해 그 버그를 재현하지 않음(동작 차이 — 의도적 수정).

function getConfirmPasswordError(confirmPassword, password) {
  if (!isValidPassword(confirmPassword)) return PASSWORD_STRENGTH_MSG;
  if (confirmPassword !== password) return PASSWORD_MISMATCH_MSG;
  return '';
}

async function signUp(formData) {
  return request('/users/signup', 'POST', formData);
}

function SignupForm() {
  const [values, setValues] = useState({ email: '', password: '', confirmPassword: '', nickname: '' });
  const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '', nickname: '', profile: '' });
  const [profileFile, setProfileFile] = useState(null);
  const navigate = useNavigate();

  // 메모리 해제 누락 방지 위해 state로 안 두고 파생 계산(설계 문서 3절 권장 패턴)
  // profileFile 바뀔 때만 URL 다시 생성 -> useMemo로 참조안정화

  //   state 방식
  // → 직접 URL을 저장하고 변경해야 함
  // → 파일 상태와 URL 상태가 어긋날 수 있음
  // → 메모리 해제도 별도로 필요

  // 파생 계산 방식
  // → profileFile만 관리
  // → profileFile이 바뀌면 URL도 함께 계산
  // → 중복 상태를 줄일 수 있음

  const profilePreviewUrl = useMemo(
    () => (profileFile ? URL.createObjectURL(profileFile) : ''),
    [profileFile]
  );

  const canSubmit =
    isValidEmail(values.email) && //이메일
    isValidPassword(values.password) && //비밀번호 
    isValidPassword(values.confirmPassword) && //비밀번호 일치 여부
    values.password === values.confirmPassword && //비밀번호 일치 여부
    !getNicknameError(values.nickname) && //닉네임
    profileFile !== null;

  function handleProfileChange(e) {
    const file = e.target.files[0];
    if (!file) {
      setProfileFile(null);
      setErrors((prev) => ({ ...prev, profile: '프로필 사진을 추가해주세요.' }));
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

  // 원본: password 필드 blur 시 강도 체크 + confirmPassword 일치 체크(확인란이 비어 있어도 무조건 검사)
  // 수정: confirmPassword 검사에 values.confirmPassword && 가드를 추가
  // -> 확인란이 비어있으면 password 필드 blur 시 불일치 에러가 뜨지 않고, 확인란에 값이 들어온 뒤에는 그대로 검사
  function handlePasswordBlur() {
    setErrors((prev) => ({
      ...prev,
      password: isValidPassword(values.password) ? '' : PASSWORD_STRENGTH_MSG,
      // password_edit.js처럼 확인란이 비어 있으면 일치 검사를 건너뜀(원본 Signup.js는 무조건 검사했음 — 의도적 변경)
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('nickname', values.nickname);
    formData.append('profile_image', profileFile);

    try {
      // TODO(0단계 후속): useAuth(AuthContext) 도입 시 회원가입 직후 자동 로그인 처리 여부 결정
      await signUp(formData);
      // 원본은 result.data.link로 하드 리다이렉트했으나, SPA 전환 후엔 로그인 라우트로 고정 이동
      navigate('/login');
    } catch (error) {
      // 원본: 409 시 field로 이메일/닉네임 중복 에러만 매핑, 그 외 상태코드는 콘솔 로그만
      if (error.status === 409) {
        if (error.field === 'email') {
          setErrors((prev) => ({ ...prev, email: '중복된 이메일 입니다.' }));
        }
        if (error.field === 'nickname') {
          setErrors((prev) => ({ ...prev, nickname: '중복된 닉네임 입니다.' }));
        }
      } else {
        console.error(error);
      }
    }
  }

  return (
    <form className="form-area" onSubmit={handleSubmit}>
      <div className="profile-area">
        <p className="form-label">프로필 사진</p>
        <p className={`helper-text${errors.profile ? ' error' : ''}`}>{errors.profile}</p>
        <label className="profile-upload">
          {profilePreviewUrl ? (
            <img className="profile-preview" src={profilePreviewUrl} alt="프로필 사진" />
          ) : (
            <span className="profile-plus">+</span>
          )}
          <input type="file" accept="image/*" hidden onChange={handleProfileChange} />
        </label>
      </div>

      <ValidatedField
        id="email"
        label="이메일"
        type="email"
        required
        placeholder="이메일을 입력하세요"
        value={values.email}
        error={errors.email}
        onChange={(v) => setValues((prev) => ({ ...prev, email: v }))} //값 저장만 
        onBlur={handleEmailBlur} // 에러 계산은 여기서 
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
