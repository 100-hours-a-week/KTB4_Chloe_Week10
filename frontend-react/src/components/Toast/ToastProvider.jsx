import { useCallback, useRef, useState } from 'react';
import { ToastContext } from './ToastContext.js';
import Toast from './Toast';

const DISPLAY_DURATION_MS = 2000; // profile_edit.js / password_edit.js의 showToast()와 동일

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: '', visible: false });
  const hideTimerRef = useRef(null);

  const showToast = useCallback((message = '수정완료') => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    setToast({ message, visible: true });
    hideTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, DISPLAY_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={toast.message} visible={toast.visible} />
    </ToastContext.Provider>
  );
}
