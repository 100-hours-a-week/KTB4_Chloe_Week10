import './ImageUploader.css';

const DEFAULT_FILE_NAME = '파일을 선택해주세요.';

// 원본: post_write.html:60-68/post_write.js:38-47, post_edit.html:59-67/post_edit.js:38-47,73-82

// ProfileImageUploader와 동일한 원칙 — 자체 상태 없음. 선택된 file은 PostForm.values.image가 소유.
// fileName은 file/existingFileName에서 파생 계산(원본의 "취소하면 기존 파일명이 사라지는" 버그 없음)

// FormData 구성/실제 업로드는 아직 미구현(PostWritePage/PostEditPage 소관, 3단계 후속).
// existingFileName은 수정 모드에서 서버에서 내려주는 기존 파일명
function ImageUploader({ file, existingFileName, onFileChange }) {
  const fileName = file ? file.name : existingFileName || DEFAULT_FILE_NAME;

  function handleChange(e) {
    onFileChange(e.target.files[0] ?? null);
  }

  return (
    <div className="form-group">
      <label className="form-label">이미지</label>
      <div className="file-input-wrap">
        <label className="btn-file" htmlFor="postImage">
          파일 선택
        </label>
        <input type="file" id="postImage" accept="image/*" hidden onChange={handleChange} />
        <span className="file-name">{fileName}</span>
      </div>
    </div>
  );
}

export default ImageUploader;
