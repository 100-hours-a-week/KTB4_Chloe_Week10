import { useMemo, useState } from 'react';
import ValidatedField from '../../components/ValidatedField/ValidatedField';
import ReadonlyField from '../../components/ReadonlyField/ReadonlyField';
import ProfileImageUploader from '../../components/ProfileImageUploader/ProfileImageUploader';
import { getNicknameError } from '../../utils/validators';
import { getProfileImageUrl } from '../../api/imageRequest';
import './ProfileEditForm.css';

// 원본: Page/Profile_edit/profile_edit.js/html
// 버그 재현 안 함 — 원본은 isValidNickname이 모듈 로드 시 false로 초기화된 뒤 submitBtn 핸들러의
// if/else if 체인 어디서도 true로 설정되지 않아(profile_edit.js:28,129-141) 제출이 항상 막혀있었을 가능성이
// 있었음. 여기선 그런 플래그 없이 getNicknameError(nickname) 결과로 canSubmit을 그때그때 계산.
function ProfileEditForm({ initialValues, onSubmit, onRequestWithdraw, serverErrors }) {
  const [nickname, setNickname] = useState(initialValues.nickname);
  const [errors, setErrors] = useState({ nickname: '' });
  const [profileFile, setProfileFile] = useState(null);

  // 409(닉네임 중복) 응답을 렌더 중에 반영 — SignupForm.jsx와 동일한 setState-during-render 패턴
  const [prevServerErrors, setPrevServerErrors] = useState(serverErrors);
  if (serverErrors && serverErrors !== prevServerErrors) {
    setPrevServerErrors(serverErrors);
    setErrors((prev) => ({ ...prev, ...serverErrors }));
  }

  // 새로 고른 파일이 있으면 그 미리보기, 없으면 서버의 기존 이미지를 그대로 표시.
  // 원본(profile_edit.js:39-56)은 Signup과 같은 검증 로직을 그대로 복붙해 프로필 사진을 항상 필수로
  // 요구했지만, 수정 화면은 이미 기존 사진이 있으므로 필수로 두지 않음(의도적으로 원본과 다르게 처리).
  const profilePreviewUrl = useMemo(
    () => (profileFile ? URL.createObjectURL(profileFile) : getProfileImageUrl(initialValues.profileImage)),
    [profileFile, initialValues.profileImage]
  );

  const canSubmit = !getNicknameError(nickname);

  function handleProfileChange(e) {
    setProfileFile(e.target.files[0] ?? null);
  }

  function handleNicknameBlur() {
    setErrors((prev) => ({ ...prev, nickname: getNicknameError(nickname) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ nickname, profileFile });
  }

  return (
    <form className="edit-section" onSubmit={handleSubmit}>
      <h2 className="edit-title">회원정보수정</h2>

      <ProfileImageUploader previewUrl={profilePreviewUrl} onFileChange={handleProfileChange} />

      <div className="form-card">
        <ReadonlyField id="email" label="이메일" value={initialValues.email} />

        <ValidatedField
          id="nickname"
          label="닉네임"
          required
          maxLength={10}
          value={nickname}
          error={errors.nickname}
          onChange={setNickname}
          onBlur={handleNicknameBlur}
        />

        <button type="submit" className={`btn-submit${canSubmit ? ' active' : ''}`} disabled={!canSubmit}>
          수정하기
        </button>

        <button type="button" className="btn-withdraw" onClick={onRequestWithdraw}>
          회원 탈퇴
        </button>
      </div>
    </form>
  );
}

export default ProfileEditForm;
