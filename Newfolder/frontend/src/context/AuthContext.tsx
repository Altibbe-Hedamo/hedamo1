import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import api from '../config/axios';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  profileStatus: string | null;
  setProfileStatus: (status: string | null) => void;
  refreshProfileStatus: () => Promise<void>;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  profileStatus: null,
  setProfileStatus: () => {},
  refreshProfileStatus: async () => {},
  login: () => {},
  logout: () => {},
  isLoading: true,
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setProfileStatus(null);
    sessionStorage.removeItem('hedamo_user');
    sessionStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const { data } = await api.get('/api/verify-token');
          if (data.success) {
            const userData = data.user;
            setUser(userData);
            sessionStorage.setItem('hedamo_user', JSON.stringify(userData)); // Refresh user data in storage

            if (userData.type === 'agent' || userData.type === 'hap') {
               try {
                const profileResponse = await api.get('/api/profiles/user');
                setProfileStatus(profileResponse.data.status);
              } catch (profileErr: any) {
                if (profileErr.response?.status === 404) {
                  setProfileStatus(null);
                }
              }
            }
          } else {
            logout();
          }
        } catch (err) {
          console.error('Token verification error:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, [token, logout]);


  const login = (userData: User, tokenData: string) => {
    const updatedUserData = {
      ...userData,
      type: userData.signup_type || userData.type,
      signup_type: userData.signup_type || userData.type
    };
    setUser(updatedUserData);
    setToken(tokenData);
    sessionStorage.setItem('hedamo_user', JSON.stringify(updatedUserData));
    sessionStorage.setItem('token', tokenData);
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`;
  };

  const refreshProfileStatus = async () => {
    if (!user || (user.type !== 'agent' && user.type !== 'hap')) return;

    try {
      const response = await api.get('/api/profiles/user');
      if (response.data.success) {
        setProfileStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error refreshing profile status:', error);
      setProfileStatus(null);
    }
  };


  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      profileStatus, 
      setProfileStatus, 
      refreshProfileStatus,
      login, 
      logout, 
      isLoading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};