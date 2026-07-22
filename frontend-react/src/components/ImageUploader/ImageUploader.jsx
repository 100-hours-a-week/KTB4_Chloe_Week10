import './ImageUploader.css';

const DEFAULT_FILE_NAME = '파일을 선택해주세요.';

// 원본: post_write.html:60-68/post_write.js:38-47, post_edit.html:59-67/post_edit.js:38-47,73-82

// ProfileImageUploader와 동일한 원칙 — 자체 상태 없음. 선택된 file은 PostForm.values.image가 소유.
// fileName은 file/existingFileName/removed에서 파생 계산(원본의 "취소하면 기존 파일명이 사라지는" 버그 없음)

// existingFileName은 수정 모드에서 서버에서 내려주는 기존 파일명
// removed: "이미지를 아예 빼겠다"는 명시적 의도(PostForm.values.removeImage) — 파일 input의 변경 이벤트만으로는
// 이 의도를 표현할 수 없어서(취소 시 change 이벤트가 안 뜨는 브라우저 특성) 별도 삭제 버튼으로 트리거.
function ImageUploader({ file, existingFileName, removed, onFileChange, onRemove }) {
  const fileName = removed ? DEFAULT_FILE_NAME : file ? file.name : existingFileName || DEFAULT_FILE_NAME;
  const canRemove = !removed && Boolean(file || existingFileName);

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
        {canRemove && (
          <button type="button" className="btn-file-remove" onClick={onRemove}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;
