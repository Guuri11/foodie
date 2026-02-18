import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import type { AuthUser } from '@domain/auth/model';
import type { AuthService } from '@domain/auth/service';

import { FirebaseAuthService } from '@infrastructure/auth/firebase-auth-service';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authService: AuthService;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authService = useMemo(() => new FirebaseAuthService(), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [authService]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      authService,
    }),
    [user, isLoading, authService]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
