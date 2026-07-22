import { useToast } from '../../context/ToastContext/useToast';
import PasswordEditForm from './PasswordEditForm';
import request from '../../api/request';

// 원본: Page/Password_edit/password_edit.js:93-95
// 버그 수정: 요청 바디에 userId를 넣지 않음 — 서버가 인증 토큰에서 사용자를 식별하므로 애초에 필요 없었음
// (react-migration-design.md 5절 — 기존 코드의 미정의 userId 참조 버그를 이관하지 않음)
async function passwordEdit(passwordData) {
  return request('/users/password', 'PATCH', passwordData);
}

function PasswordEditPage() {
  const { showToast } = useToast();

  // 원본 editPasswordBtn 핸들러(password_edit.js:105-120)의 API 호출 부분만 이관(검증은 PasswordEditForm 소관)
  async function handleSubmit({ password }) {
    await passwordEdit({ password });
    showToast();
  }

  return <PasswordEditForm onSubmit={handleSubmit} />;
}

export default PasswordEditPage;
