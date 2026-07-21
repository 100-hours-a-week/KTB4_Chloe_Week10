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
    image: null, // TODO(3단계 후속): ImageUploader 구현 시 실제 File 객체 연결
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

        <ImageUploader />

        <button
          type="submit"
          className={`btn-submit${canSubmit ? ' active' : ''}`}
          disabled={!canSubmit || submitting}
        >
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

export default PostForm;
