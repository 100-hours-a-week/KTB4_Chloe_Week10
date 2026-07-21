import { useCallback, useRef, useState } from 'react';
import { ToastContext } from './ToastContext.js';
import Toast from '../../components/Toast/Toast';

const DISPLAY_DURATION_MS = 2000; // profile_edit.js / password_edit.js의 showToast()와 동일

export function ToastProvider({ children }) {

  //토스트 상태 저장
  const [toast, setToast] = useState({ message: '', visible: false });

  // hideTimerRef에는 setTimeout으로 만든 타이머를 저장
  // useRef를 사용하는 이유는 타이머 값을 저장 & 그 값이 바뀔 때 컴포넌트를 다시 렌더링할 필요없음
  const hideTimerRef = useRef(null);

  // 메세지 전달 안하면 기본값 수정완료
  const showToast = useCallback((message = '수정완료') => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current); //기존 타이머 제거

    setToast({ message, visible: true }); // 토스트 보이도록 

    // 함수형 업데이트 방식 사용해서 
    // 현재 렌더링 시점의 toast 값을 사용하도록 
    hideTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, DISPLAY_DURATION_MS);
  }, []);

  return (
    //ToastContext.Provider로 showToast를 공유함
    // children은 showToast 사용 가능
    // Context 범위 설정
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={toast.message} visible={toast.visible} />
    </ToastContext.Provider>
  );
}
