import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { API_BASE_URL } from './api-config';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('stores the returned token and user after login', () => {
    const response = {
      token: 'test.jwt.token',
      user: { id: 7, username: 'admin', fullName: 'Administrator', role: 'admin' },
    };
    let receivedToken: string | undefined;

    auth.login('admin', 'password').subscribe((result) => {
      receivedToken = result.token;
    });

    const request = http.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush(response);

    expect(receivedToken).toBe(response.token);
    expect(localStorage.getItem('auth_token')).toBe(response.token);
    expect(JSON.parse(localStorage.getItem('auth_user') ?? '{}')).toEqual(response.user);
  });

  it('accepts a token with a future expiration', () => {
    localStorage.setItem('auth_token', makeToken(Date.now() / 1000 + 60));

    expect(auth.isAuthenticated()).toBeTrue();
  });

  it('clears an expired token and its user', () => {
    localStorage.setItem('auth_token', makeToken(Date.now() / 1000 - 60));
    localStorage.setItem('auth_user', JSON.stringify({ username: 'admin' }));

    expect(auth.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});

function makeToken(expiration: number): string {
  return `header.${btoa(JSON.stringify({ exp: expiration }))}.signature`;
}
