import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { API_BASE_URL } from './api-config';

describe('authInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => http.verify());

  it('attaches the bearer token to backend requests', () => {
    localStorage.setItem('auth_token', 'stored.jwt.token');

    client.get(`${API_BASE_URL}/menu`).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/menu`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer stored.jwt.token');
    request.flush([]);
  });

  it('clears the session and redirects to login on a 401', () => {
    localStorage.setItem('auth_token', 'stored.jwt.token');
    localStorage.setItem('auth_user', JSON.stringify({ username: 'admin' }));
    const navigate = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    client.get(`${API_BASE_URL}/menu`).subscribe({ error: () => undefined });

    const request = http.expectOne(`${API_BASE_URL}/menu`);
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
