import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { DokterService } from './dokter.service';

describe('DokterService', () => {
  let service: DokterService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DokterService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the selected doctor master-detail endpoint', () => {
    let response: unknown;
    service.getDetails(5).subscribe((result) => {
      response = result;
    });

    const request = http.expectOne(`${API_BASE_URL}/dokter/5/details`);
    expect(request.request.method).toBe('GET');
    request.flush({ master_dokter: { id_dokter: 5 } });

    expect(response).toEqual({ master_dokter: { id_dokter: 5 } });
  });
});
