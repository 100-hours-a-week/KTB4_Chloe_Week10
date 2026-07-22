import { useState } from 'react';
import ValidatedField from '../ValidatedField/ValidatedField';
import ImageUploader from '../ImageUploader/ImageUploader';
import './PostForm.css';

const TITLE_MAX_LENGTH = 26;

const MODE_TEXT = {
  create: { heading: '게시글 작성', submitLabel: '등록' },
  edit: { heading: '게시글 수정', submitLabel: '수정하기' },
};

function PostForm({ mode, initialValues, onSubmit, submitting = false }) {
  const [values, setValues] = useState({
    title: initialValues?.title ?? '',
    content: initialValues?.content ?? '',
    image: null,
    removeImage: false,
  });

  const { heading, submitLabel } = MODE_TEXT[mode];

  const canSubmit = values.title !== '' && values.content !== '';

  function handleSubmit(e) {
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
          showCharCount
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
          onFileChange={(file) => setValues((prev) => ({ ...prev, image: file, removeImage: false }))}
          onRemove={() => setValues((prev) => ({ ...prev, image: null, removeImage: true }))}
        />

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
