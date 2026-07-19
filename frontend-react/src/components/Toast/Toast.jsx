import './Toast.css';

// 표시 여부는 useToast()가 관리한다 — 이 컴포넌트는 message/visible만 받아 그리는 무상태 컴포넌트.
function Toast({ message, visible }) {
  return <div className={`toast${visible ? ' show' : ''}`}>{message}</div>;
}

export default Toast;
