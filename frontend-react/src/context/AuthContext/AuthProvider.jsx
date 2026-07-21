import { useCallback, useState } from 'react';
import { AuthContext } from './AuthContext.js';

// localStorage의 accessToken을 단일 소스로 삼아 로그인 상태를 여러 컴포넌트(Header 등)에
// reactive하게 공유한다.(값이 바뀌면 그 값을 사용하는 컴포넌트들이 자동으로 다시 렌더링 되어서 최신값을 반영한다는 이야기 )
// request.js는 fetch 래퍼라 이 Context를 구독할 수 없어 계속 -> request.js는 그냥 일반 함수이기 때문에 Hook 사용 불가
// localStorage.getItem('accessToken')을 직접 읽는다 
// 여기서도 login/logout 시 localStorage를 함께 갱신해 두 소스가 항상 같은 값을 가리키도록 동기화한다.
export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));

  const login = useCallback((token) => {
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
  }, []);

  const isAuthenticated = accessToken !== null; //토큰이 있으면 로그인 상태 & 토큰 없으면 로그아웃 상태

  return (
    <AuthContext.Provider value={{ accessToken, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
