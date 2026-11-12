import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface MenuItem {
  id: number;
  menu_name: string;
  url_menu: string;
  parent_id: number;
  is_active: number;
  children: MenuItem[];
}

export interface MenuWrite {
  menu_name: string;
  url_menu: string;
  parent_id: number;
  is_active: number;
}

export interface BulkDeleteResult {
  message: string;
  deletedCount: number;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  getMenus(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${API_BASE_URL}/menu`);
  }

  getAllMenus(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${API_BASE_URL}/menu/manage`);
  }

  createMenu(menu: MenuWrite): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/menu`, menu);
  }

  updateMenu(id: number, menu: MenuWrite): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/menu/${id}`, menu);
  }

  deleteMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/menu/${id}`);
  }

  bulkDelete(ids: number[]): Observable<BulkDeleteResult> {
    return this.http.delete<BulkDeleteResult>(`${API_BASE_URL}/menu/bulk-delete`, {
      body: ids,
    });
  }
}
