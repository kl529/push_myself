'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, getCurrentUser, onAuthStateChange, migrateLocalDataToUser } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 초기 사용자 상태 확인
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const { user: currentUser, error: authError } = await getCurrentUser();
        if (authError) {
          console.error('초기 인증 확인 오류:', authError);
          setError(authError.message);
        } else if (currentUser) {
          setUser(currentUser);
          // 로컬 데이터가 있으면 마이그레이션 수행
          await migrateLocalDataToUser(currentUser.id);
        }
      } catch (error) {
        console.error('초기 인증 상태 확인 중 오류:', error);
        setError('인증 상태를 확인할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    checkInitialAuth();
  }, []);

  // 인증 상태 변경 리스너 설정
  useEffect(() => {
    const { unsubscribe } = onAuthStateChange(async (authUser) => {
      setUser(authUser);
      setError(null);
      
      if (authUser) {
        // 새로 로그인한 사용자의 경우 로컬 데이터 마이그레이션
        await migrateLocalDataToUser(authUser.id);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    // 로그인은 LoginModal에서 처리되므로 여기서는 빈 함수
    // 실제 로그인은 signInWithGoogle 함수를 직접 호출
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { signOut } = await import('../services/authService');
      const { error } = await signOut();
      
      if (error) {
        setError('로그아웃에 실패했습니다.');
        console.error('로그아웃 오류:', error);
      } else {
        setUser(null);
        setError(null);
      }
    } catch (error) {
      setError('로그아웃 중 오류가 발생했습니다.');
      console.error('로그아웃 처리 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;