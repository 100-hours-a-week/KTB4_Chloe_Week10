import { memo, useEffect } from 'react';
import './ConfirmModal.css';

// post_delete_modal / comment_delete_modal / withdraw_modal 3곳을 대체하는 범용 컴포넌트.
// 완전 제어 컴포넌트 — open 여부와 문구, 확인/취소 콜백을 모두 props로 받는다.
// React.memo: open 여부가 바뀔 때만 리렌더링(Post Detail 페이지에서 게시글/댓글 삭제용 2곳에 사용).
function ConfirmModal({ open, title, description, onConfirm, onCancel, confirmLabel = '확인', cancelLabel = '취소' }) {
  useEffect(() => {
    if (!open) return undefined;

    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-desc">{description}</p>
        <div className="modal-btns">
          <button type="button" className="btn-modal-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn-modal-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ConfirmModal);
