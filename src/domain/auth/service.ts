import type { AuthUser } from './model';

export interface AuthService {
  getCurrentUser(): AuthUser | null;
  getToken(): Promise<string | null>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<AuthUser>;
  register(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
}
