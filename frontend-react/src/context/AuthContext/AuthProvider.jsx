import { useCallback, useState } from 'react';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('profileImage'));

  const login = useCallback((token, profileImage) => {
    localStorage.setItem('accessToken', token);
    setAccessToken(token);

    if (profileImage) {
      localStorage.setItem('profileImage', profileImage);
    } else {
      localStorage.removeItem('profileImage');
    }
    setProfileImage(profileImage ?? null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('profileImage');
    setAccessToken(null);
    setProfileImage(null);
  }, []);

  const isAuthenticated = accessToken !== null;

  return (
    <AuthContext.Provider value={{ accessToken, profileImage, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
