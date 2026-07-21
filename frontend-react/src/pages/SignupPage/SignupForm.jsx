import { useMemo, useState } from 'react';
import ValidatedField from '../../components/ValidatedField/ValidatedField';
import ProfileImageUploader from '../../components/ProfileImageUploader/ProfileImageUploader';
import { isValidEmail, isValidPassword, getNicknameError } from '../../utils/validators';
import './SignupForm.css';

const PASSWORD_STRENGTH_MSG =
  '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
const PASSWORD_MISMATCH_MSG = '비밀번호가 일치하지 않습니다.';
const PROFILE_REQUIRED_MSG = '프로필 사진을 추가해주세요.';

// 원본: 비밀번호 확인 검증. 두 blur 핸들러가 강도체크→일치체크를 순차 실행하며 뒤 블록이 앞 블록을
// 무조건 덮어써서, 약한 비밀번호를 같은 값으로 두 번 입력하면 "유효"로 잘못 표시되는 원본 버그가 있었음.
// 여기서는 else-if 우선순위로 재현해 그 버그를 재현하지 않음(동작 차이 — 의도적 수정).

function getConfirmPasswordError(confirmPassword, password) {
  if (!isValidPassword(confirmPassword)) return PASSWORD_STRENGTH_MSG;
  if (confirmPassword !== password) return PASSWORD_MISMATCH_MSG;
  return '';
}

// API 호출/이동/409 에러 매핑은 SignupPage 소관 — 이 컴포넌트는 입력값·검증만 담당하고
// onSubmit prop으로 위임한다. serverErrors는 SignupPage가 409 응답을 받아 내려주는 필드별 에러.
function SignupForm({ onSubmit, serverErrors }) {
  const [values, setValues] = useState({ email: '', password: '', confirmPassword: '', nickname: '' });
  // 원본: Signup.js:37 setProfileInvalid() — 페이지 진입 즉시 프로필 사진 필드를 에러 상태로 미리 세팅.
  // 필수 항목인지 모르고 다른 필드만 채웠을 때 제출 버튼이 계속 비활성 상태인 이유를 알 수 있도록 함.
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    profile: PROFILE_REQUIRED_MSG,
  });
  const [profileFile, setProfileFile] = useState(null);

  // serverErrors(409 응답)를 렌더 중에 errors로 반영 — useEffect 대신 "이전 렌더와 비교해
  // 달라졌을 때만 반영" 패턴 사용(React 공식 문서의 setState-during-render 패턴)
  const [prevServerErrors, setPrevServerErrors] = useState(serverErrors);
  if (serverErrors && serverErrors !== prevServerErrors) {
    setPrevServerErrors(serverErrors);
    setErrors((prev) => ({ ...prev, ...serverErrors }));
  }

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
