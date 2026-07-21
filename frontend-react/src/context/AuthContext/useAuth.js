import { useContext } from 'react';
import { AuthContext } from './AuthContext.js';


// AuthProvider 하위 컴포넌트들이 useAuth를 통해 AuthContext의 값을 가져올 수 있음
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
}
