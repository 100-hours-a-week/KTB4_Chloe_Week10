import './ImageUploader.css';

const DEFAULT_FILE_NAME = '파일을 선택해주세요.';

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
