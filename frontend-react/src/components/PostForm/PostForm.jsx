import { useState } from 'react';
import ValidatedField from '../ValidatedField/ValidatedField';
import ImageUploader from '../ImageUploader/ImageUploader';
import './PostForm.css';

const TITLE_MAX_LENGTH = 26;

const MODE_TEXT = {
  create: { heading: '게시글 작성', submitLabel: '등록' },
  edit: { heading: '게시글 수정', submitLabel: '수정하기' },
};

// 원본: post_write.js/post_edit.js — 90% 이상 동일한 두 파일을 mode prop으로 합성.
// FormData 구성/API 호출은 PostWritePage/PostEditPage 소관(design doc 4절) — 여기선 onSubmit(values)로만 위임.
function PostForm({ mode, initialValues, onSubmit, submitting = false }) {
  const [values, setValues] = useState({
    title: initialValues?.title ?? '',
    content: initialValues?.content ?? '',
    image: null, // 새로 선택한 File. edit 모드에서 안 바꾸면 null 유지 → 기존 이미지는 initialValues.postImage로만 표시
    removeImage: false, // "기존 이미지를 아예 빼겠다"는 명시적 의도(삭제 버튼으로만 true가 됨)
  });

  const { heading, submitLabel } = MODE_TEXT[mode];

  // 원본 activeWriteCompleteButton/activeEditCompleteButton과 동일 — 공백 문자열만 아니면 통과(trim 없음)
  const canSubmit = values.title !== '' && values.content !== '';

  function handleSubmit(e) {
    // 폼 제출시 기본 동작 방지
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(values);
  }

  return (
    <section className="write-section">
      <h2 className="write-title">{heading}</h2>

      <form onSubmit={handleSubmit}>
        <ValidatedField
          id="postTitle"
          label="제목"
          required
          maxLength={TITLE_MAX_LENGTH}
          showCharCount //값 없이 속성만 보내면 true
          placeholder={`제목을 입력해주세요. (최대 ${TITLE_MAX_LENGTH}글자)`}
          value={values.title}
          onChange={(v) => setValues((prev) => ({ ...prev, title: v }))}
        />

        <ValidatedField
          id="postContent"
          label="내용"
          required
          multiline
          placeholder="내용을 입력해주세요."
          value={values.content}
          onChange={(v) => setValues((prev) => ({ ...prev, content: v }))}
        />

        <ImageUploader
          file={values.image}
          existingFileName={initialValues?.postImage}
          removed={values.removeImage}
          //image에 file이 들어오면 상태 변경하고 아니면 그냥 null로 — 새 파일을 고르면 삭제 의도는 취소
          onFileChange={(file) => setValues((prev) => ({ ...prev, image: file, removeImage: false }))}
          onRemove={() => setValues((prev) => ({ ...prev, image: null, removeImage: true }))}
        />

        <button
          type="submit"
          className={`btn-submit${canSubmit ? ' active' : ''}`}
          disabled={!canSubmit || submitting}
          // canSubmit이 false 거나, submitting이 true 면 버튼 비활성화
        >
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

export default PostForm;
