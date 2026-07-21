import './ImageUploader.css';

// 원본: post_write.html:60-68 / post_edit.html:59-67 (파일 선택 + fileName 표시)
// TODO(3단계 후속): 파일 선택 input, fileName 갱신, PostForm.values.image 연동은 아직 구현 안 함 — 자리만 확보.
function ImageUploader() {
  return (
    <div className="form-group">
      <label className="form-label">이미지</label>
      <div className="file-input-wrap">
        <span className="file-name">파일을 선택해주세요.</span>
      </div>
    </div>
  );
}

export default ImageUploader;
