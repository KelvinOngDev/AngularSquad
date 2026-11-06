import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

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
        void this.router.navigateByUrl('/dashboard');
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
