import type { AuthUser } from '@domain/auth/model';
import type { AuthService } from '@domain/auth/service';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { firebaseAuth } from './firebase-config';

function toAuthUser(firebaseUser: { uid: string; email: string | null }): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
  };
}

export class FirebaseAuthService implements AuthService {
  getCurrentUser(): AuthUser | null {
    const user = firebaseAuth.currentUser;
    return user ? toAuthUser(user) : null;
  }

  async getToken(): Promise<string | null> {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(firebaseAuth, (firebaseUser) => {
      callback(firebaseUser ? toAuthUser(firebaseUser) : null);
    });
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return toAuthUser(credential.user);
  }

  async register(email: string, password: string): Promise<AuthUser> {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return toAuthUser(credential.user);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(firebaseAuth);
  }
}
