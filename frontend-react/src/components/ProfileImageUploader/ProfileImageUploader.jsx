import './ProfileImageUploader.css';

// 설계 문서(react-migration-design.md:165) 대응 — 프로필 이미지 선택 + 미리보기.
// 자체 상태 없음: previewUrl은 부모(SignupForm)가 profileFile로부터 계산해 내려준다.
function ProfileImageUploader({ previewUrl, onFileChange, error }) {
  return (
    <div className="profile-area">
      <p className="form-label">프로필 사진</p>
      <p className={`helper-text${error ? ' error' : ''}`}>{error}</p>
      <label className="profile-upload">
        {previewUrl ? (
          <img className="profile-preview" src={previewUrl} alt="프로필 사진" />
        ) : (
          <span className="profile-plus">+</span>
        )}
        <input type="file" accept="image/*" hidden onChange={onFileChange} />
      </label>
    </div>
  );
}

export default ProfileImageUploader;
