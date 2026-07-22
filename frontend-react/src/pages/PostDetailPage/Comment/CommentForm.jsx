import { useState } from 'react';
import './CommentForm.css';

// 원본: post_detail.html:117-126, post_detail.js:77-86,267-278,345-389
// 등록/수정 겸용 입력창 — draft(입력 중인 텍스트)는 이 컴포넌트가 소유.

// editingComment가 바뀌면(수정 버튼 클릭) 기존 댓글 내용을 프리필.

// useEffect 대신 "이전 렌더와 비교해 달라졌을 때만 반영" 패턴 사용(SignupForm.jsx와 동일 패턴,React 공식 문서의 setState-during-render).
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
