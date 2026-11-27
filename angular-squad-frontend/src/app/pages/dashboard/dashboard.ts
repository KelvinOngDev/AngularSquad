import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { API_BASE_URL } from '../../services/api-config';
import { AuthService } from '../../services/auth.service';

interface CountSummary {
  name: string;
  count: number;
}

interface DoctorSummary {
  id: number;
  nama_dokter: string;
  keahlian: string | null;
  status_aktif: string;
  max_layanan_harian: number;
  pendaftaran_hari_ini: number;
}

interface DashboardSummary {
  doctor_count: number;
  active_doctor_count: number;
  total_capacity: number;
  today_registration_count: number;
  pending_registration_count: number;
  approved_registration_count: number;
  doctors: DoctorSummary[];
  service_stats: CountSummary[];
  status_stats: CountSummary[];
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly doctorCount = signal(0);
  protected readonly activeDoctorCount = signal(0);
  protected readonly totalCapacity = signal(0);
  protected readonly todayRegistrationCount = signal(0);
  protected readonly pendingRegistrationCount = signal(0);
  protected readonly approvedRegistrationCount = signal(0);
  protected readonly doctors = signal<DoctorSummary[]>([]);
  protected readonly serviceStats = signal<CountSummary[]>([]);
  protected readonly statusStats = signal<CountSummary[]>([]);
  protected readonly currentUser = this.auth.getUser();
  protected readonly today = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  constructor() {
    this.loadDashboard();
  }

  protected reload(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.http.get<DashboardSummary>(`${API_BASE_URL}/dokter/dashboard-summary`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (summary) => {
          this.doctorCount.set(summary.doctor_count);
          this.activeDoctorCount.set(summary.active_doctor_count);
          this.totalCapacity.set(summary.total_capacity);
          this.todayRegistrationCount.set(summary.today_registration_count);
          this.pendingRegistrationCount.set(summary.pending_registration_count);
          this.approvedRegistrationCount.set(summary.approved_registration_count);
          this.doctors.set(summary.doctors);
          this.serviceStats.set(summary.service_stats);
          this.statusStats.set(summary.status_stats);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to load dashboard data.', error);
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
