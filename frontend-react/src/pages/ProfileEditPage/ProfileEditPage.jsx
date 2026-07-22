import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/useAuth';
import { useToast } from '../../context/ToastContext/useToast';
import ProfileEditForm from './ProfileEditForm';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import request from '../../api/request';

async function getUser() {
  return request('/users', 'GET');
}

async function updateUser(formData) {
  return request('/users', 'PATCH', formData);
}

async function withdrawUser() {
  return request('/users', 'DELETE');
}

function ProfileEditPage() {
  const navigate = useNavigate();
  const { accessToken, login, logout } = useAuth();
  const { showToast } = useToast();

  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getUser();
        if (!cancelled) setUser(result.data);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit({ nickname, profileFile }) {
    const formData = new FormData();
    formData.append('nickname', nickname);
    if (profileFile) {
      formData.append('profileImage', profileFile);
    }

    try {
      const result = await updateUser(formData);
      setUser(result.data);
      login(accessToken, result.data.profileImage);
      showToast();
    } catch (err) {
      if (err.status === 409 && err.field === 'nickname') {
        setServerErrors({ nickname: '중복된 닉네임 입니다.' });
      } else {
        console.error(err);
      }
    }
  }

  async function handleConfirmWithdraw() {
    try {
      await withdrawUser();
      logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    } finally {
      setWithdrawModalOpen(false);
    }
  }

  if (error) {
    return <p>회원 정보를 불러오지 못했습니다.</p>;
  }

  if (!user) {
    return <p>회원 정보를 불러오는 중입니다.</p>;
  }

  return (
    <>
      <ProfileEditForm
        initialValues={user}
        onSubmit={handleSubmit}
        onRequestWithdraw={() => setWithdrawModalOpen(true)}
        serverErrors={serverErrors}
      />

      <ConfirmModal
        open={withdrawModalOpen}
        title="회원탈퇴 하시겠습니까?"
        description="작성된 게시글과 댓글은 삭제됩니다."
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setWithdrawModalOpen(false)}
      />
    </>
  );
}

export default ProfileEditPage;
