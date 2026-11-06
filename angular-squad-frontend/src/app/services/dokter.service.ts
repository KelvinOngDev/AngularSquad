import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface DokterMasterDetailResponse {
  master_dokter: DokterMaster;
}

export interface DokterMaster {
  id_dokter: number;
  nama_dokter: string;
  keahlian: string | null;
  max_layanan_harian: number;
  kuota_terpakai_hari_ini: number;
  detail_pendaftaran: Pendaftaran[];
  detail_jadwal_operasi: JadwalOperasi[];
}

export interface Pendaftaran {
  id_pendaftaran: number;
  id_pasien: number | null;
  tanggal_daftar: string | null;
  jenis_layanan: string | null;
  status_validasi: string | null;
}

export interface JadwalOperasi {
  id_jadwal_operasi: number;
  id_pendaftaran: number | null;
  id_ruang_operasi: number | null;
  tanggal_operasi: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  status_operasi: string | null;
}

@Injectable({ providedIn: 'root' })
export class DokterService {
  private readonly http = inject(HttpClient);

  getDetails(id: number): Observable<DokterMasterDetailResponse> {
    return this.http.get<DokterMasterDetailResponse>(`${API_BASE_URL}/dokter/${id}/details`);
  }
}
