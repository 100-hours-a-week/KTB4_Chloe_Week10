import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/useAuth';
import { useToast } from '../../context/ToastContext/useToast';
import ProfileEditForm from './ProfileEditForm';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import request from '../../api/request';

// 원본: Page/Profile_edit/profile_edit.js
// getUser/updateUser/withdrawUser 3개 API를 이 페이지가 모두 소유(design doc 4절) — 원본이
// 이 중 일부를 request.js 우회해 직접 fetch하던 부분도 여기선 request 공용 함수로 통일.
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

  // 원본 profile_edit.js:80-95 DOMContentLoaded의 getUser() 조회를 이관.
  // cancelled 가드는 usePostDetail/PostEditPage와 동일 패턴.
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

  // 원본 submitBtn 핸들러(profile_edit.js:124-197) — 검증 통과 후 부분만 이관(검증 자체는 ProfileEditForm 소관)
  async function handleSubmit({ nickname, profileFile }) {
    const formData = new FormData();
    formData.append('nickname', nickname);
    if (profileFile) {
      formData.append('profileImage', profileFile);
    }

    try {
      const result = await updateUser(formData);
      setUser(result.data);
      // Header의 프로필 아이콘도 AuthContext.profileImage를 구독하므로 같이 갱신(원본의
      // headerProfileIcon.src 직접 대입 대응). accessToken은 그대로 유지.
      login(accessToken, result.data.profileImage);
      showToast();
    } catch (err) {
      // 원본: 409 시 닉네임 중복만 매핑, 그 외 상태코드는 콘솔 로그만(profile_edit.js:184-193)
      if (err.status === 409 && err.field === 'nickname') {
        setServerErrors({ nickname: '중복된 닉네임 입니다.' });
      } else {
        console.error(err);
      }
    }
  }

  // 원본 withdrawConfirmBtn 핸들러(profile_edit.js:102-109)
  // 원본은 response.data.link로 하드 리다이렉트했으나, SPA 전환 후엔 로그인 라우트로 고정 이동(SignupPage와 동일 패턴)
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
