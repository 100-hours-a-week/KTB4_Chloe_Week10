import { useMemo, useState } from 'react';
import ValidatedField from '../../components/ValidatedField/ValidatedField';
import ReadonlyField from '../../components/ReadonlyField/ReadonlyField';
import ProfileImageUploader from '../../components/ProfileImageUploader/ProfileImageUploader';
import { getNicknameError } from '../../utils/validators';
import { getProfileImageUrl } from '../../api/imageRequest';
import './ProfileEditForm.css';

function ProfileEditForm({ initialValues, onSubmit, onRequestWithdraw, serverErrors }) {
  const [nickname, setNickname] = useState(initialValues.nickname);
  const [errors, setErrors] = useState({ nickname: '' });
  const [profileFile, setProfileFile] = useState(null);

  const [prevServerErrors, setPrevServerErrors] = useState(serverErrors);
  if (serverErrors && serverErrors !== prevServerErrors) {
    setPrevServerErrors(serverErrors);
    setErrors((prev) => ({ ...prev, ...serverErrors }));
  }

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
