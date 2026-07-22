import './ProfileImageUploader.css';

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
