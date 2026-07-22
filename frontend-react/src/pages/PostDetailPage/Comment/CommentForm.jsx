import { useState } from 'react';
import './CommentForm.css';

function CommentForm({ editingComment, onSubmit, onCancelEdit }) {
  const [draft, setDraft] = useState('');
  const isEditing = Boolean(editingComment);

  const [prevEditingComment, setPrevEditingComment] = useState(editingComment);
  if (editingComment !== prevEditingComment) {
    setPrevEditingComment(editingComment);
    setDraft(editingComment ? editingComment.commentContent : '');
  }

  async function handleSubmit() {
    if (!draft) return;

    try {
      await onSubmit(draft);
      setDraft('');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="comment-input-area">
      <textarea
        className="comment-textarea"
        placeholder="댓글을 남겨주세요!"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="comment-submit-row">
        {isEditing && (
          <button type="button" className="btn-comment-cancel-edit" onClick={onCancelEdit}>
            취소
          </button>
        )}
        <button
          type="button"
          className={`btn-comment-submit${draft ? ' active' : ''}`}
          disabled={!draft}
          onClick={handleSubmit}
        >
          {isEditing ? '댓글 수정' : '댓글 등록'}
        </button>
      </div>
    </div>
  );
}

export default CommentForm;
