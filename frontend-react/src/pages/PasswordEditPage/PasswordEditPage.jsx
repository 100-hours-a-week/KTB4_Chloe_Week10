import { useToast } from '../../context/ToastContext/useToast';
import PasswordEditForm from './PasswordEditForm';
import request from '../../api/request';

async function passwordEdit(passwordData) {
  return request('/users/password', 'PATCH', passwordData);
}

function PasswordEditPage() {
  const { showToast } = useToast();

  async function handleSubmit({ password }) {
    await passwordEdit({ password });
    showToast();
  }

  return <PasswordEditForm onSubmit={handleSubmit} />;
}

export default PasswordEditPage;
