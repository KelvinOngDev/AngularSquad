import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected username = '';
  protected password = '';
  protected errorMessage = '';
  protected isSubmitting = false;

  protected submit(): void {
    if (this.isSubmitting || !this.username.trim() || !this.password) {
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.isSubmitting = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination = returnUrl?.startsWith('/') ? returnUrl : '/dashboard';
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.errorMessage = error instanceof HttpErrorResponse && error.status === 401
          ? 'Username atau password salah.'
          : 'Login gagal. Periksa koneksi ke server lalu coba lagi.';
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
          console.error('Login request failed.', error);
        }
      },
    });
  }
}
