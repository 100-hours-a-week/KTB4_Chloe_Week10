import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

// TODO(0단계 후속): accessToken 삭제/프로필 이미지 조회는 useAuth(AuthContext) 도입 시 그쪽으로 이관
function Header({ profileImageUrl = '' }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  function handleToggleDropdown() {
    setDropdownOpen((prev) => !prev);
  }

  function handleLogout() {
    localStorage.removeItem('accessToken');
    navigate('/login');
  }

  return (
    <div className="sidebar-profile">
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
