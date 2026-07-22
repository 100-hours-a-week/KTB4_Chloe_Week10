import './Toast.css';

function Toast({ message, visible }) {
  return <div className={`toast${visible ? ' show' : ''}`}>{message}</div>;
}

export default Toast;
