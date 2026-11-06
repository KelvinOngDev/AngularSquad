import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface AuthenticatedUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}/auth/login`, { username, password })
      .pipe(tap((response) => this.saveSession(response)));
  }

  getToken(): string | null {
    return this.storage()?.getItem(this.tokenKey) ?? null;
  }

  getUser(): AuthenticatedUser | null {
    const storedUser = this.storage()?.getItem(this.userKey);
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthenticatedUser;
    } catch {
      this.clearSession();
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const payload = token.split('.')[1];
    if (!payload) {
      this.clearSession();
      return false;
    }

    try {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(atob(base64)) as { exp?: unknown };
      const isUnexpired = typeof claims.exp === 'number' && claims.exp * 1000 > Date.now();
      if (!isUnexpired) {
        this.clearSession();
      }
      return isUnexpired;
    } catch {
      this.clearSession();
      return false;
    }
  }

  clearSession(): void {
    this.storage()?.removeItem(this.tokenKey);
    this.storage()?.removeItem(this.userKey);
  }

  private saveSession(response: LoginResponse): void {
    const storage = this.storage();
    if (!storage) {
      throw new Error('Browser local storage is unavailable.');
    }

    storage.setItem(this.tokenKey, response.token);
    storage.setItem(this.userKey, JSON.stringify(response.user));
  }

  private storage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }
}
