import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext/useAuth';
import { getProfileImageUrl } from '../../../api/imageRequest';
import './Header.css';

// TODO(0단계 후속): 프로필 이미지 조회는 useAuth(AuthContext)에 사용자 정보가 추가되면 그쪽으로 이관
// variant: 'sidebar'(펼침 상태, 사이드바 하단 고정) | 'topbar'(접힘 상태, collapsed-topbar 우측) — 드롭다운 열리는 방향이 서로 반대라 분기
function Header({ variant = 'sidebar' }) {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { profileImage, logout } = useAuth();
  const profileImageUrl = getProfileImageUrl(profileImage);

  function handleToggleDropdown() {
    setDropdownOpen((prev) => !prev);
  }

  // 로그아웃 로직
  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={`sidebar-profile sidebar-profile--${variant}`}>
      <button type="button" className="btn-profile-header" onClick={handleToggleDropdown}>
        <img className="profile-icon" src={profileImageUrl} alt="프로필" />
      </button>

      <div className={`dropdown-menu${dropdownOpen ? ' active' : ''}`}>
        <Link to="/profile-edit" className="dropdown-item">회원정보수정</Link>
        <Link to="/password-edit" className="dropdown-item">비밀번호수정</Link>
        <button type="button" className="dropdown-item" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default Header;
