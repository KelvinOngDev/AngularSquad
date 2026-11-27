import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../services/api-config';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard summary data', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API_BASE_URL}/dokter/dashboard-summary`).flush({
      doctor_count: 5,
      active_doctor_count: 5,
      total_capacity: 250,
      today_registration_count: 2,
      pending_registration_count: 1,
      approved_registration_count: 1,
      doctors: [],
      service_stats: [],
      status_stats: [],
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ringkasan sistem');
  });
});
