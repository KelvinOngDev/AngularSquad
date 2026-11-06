import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface MenuItem {
  id: number;
  menu_name: string;
  url_menu: string;
  parent_id: number;
  children: MenuItem[];
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  getMenus(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${API_BASE_URL}/menu`);
  }
}
