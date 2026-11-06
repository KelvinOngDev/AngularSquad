import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DokterMaster, DokterService } from '../../services/dokter.service';

@Component({
  selector: 'app-dokter-dashboard',
  imports: [FormsModule],
  templateUrl: './dokter-dashboard.html',
})
export class DokterDashboard implements OnInit {
  private readonly dokterService = inject(DokterService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly dokter = signal<DokterMaster | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly activeTab = signal<'pendaftaran' | 'operasi'>('pendaftaran');
  protected readonly quotaPercent = computed(() => {
    const data = this.dokter();
    if (!data || data.max_layanan_harian <= 0) {
      return 0;
    }

    return Math.min(100, (data.kuota_terpakai_hari_ini / data.max_layanan_harian) * 100);
  });

  protected doctorIdInput = '5';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const rawId = params.get('id');
      const id = rawId === null ? 5 : Number(rawId);
      if (rawId !== null && (!Number.isInteger(id) || id < 1)) {
        this.dokter.set(null);
        this.isLoading.set(false);
        this.errorMessage.set('ID dokter harus berupa bilangan bulat positif.');
        return;
      }

      this.doctorIdInput = String(id);
      this.loadDoctor(id);
    });
  }

  protected selectDoctor(): void {
    const id = Number(this.doctorIdInput);
    if (!Number.isInteger(id) || id < 1) {
      this.errorMessage.set('Masukkan ID dokter berupa bilangan bulat positif.');
      return;
    }

    void this.router.navigate(['/master-detail', id]);
  }

  protected formatTime(value: string | null): string {
    return value ? value.slice(0, 5) : '-';
  }

  private loadDoctor(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dokterService.getDetails(id).subscribe({
      next: (response) => {
        this.dokter.set(response.master_dokter);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.dokter.set(null);
        this.isLoading.set(false);
        this.errorMessage.set(error instanceof HttpErrorResponse && error.status === 404
          ? 'Dokter tidak ditemukan.'
          : 'Data dokter gagal dimuat. Periksa koneksi API dan pastikan Anda sudah login.');
        console.error('Failed to load doctor master details.', error);
      },
    });
  }
}
