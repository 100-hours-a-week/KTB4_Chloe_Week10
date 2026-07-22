import { memo, useEffect } from 'react';
import './ConfirmModal.css';

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
