import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, map, tap } from 'rxjs';
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
  private readonly menuChanges = new Subject<void>();
  readonly menuChanges$ = this.menuChanges.asObservable();

  getMenus(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${API_BASE_URL}/menu`).pipe(
      map((menus) => this.normalizeMenuTree(menus)),
    );
  }

  getAllMenus(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${API_BASE_URL}/menu/manage`);
  }

  createMenu(menu: MenuWrite): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/menu`, menu).pipe(
      tap(() => this.menuChanges.next()),
    );
  }

  updateMenu(id: number, menu: MenuWrite): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/menu/${id}`, menu).pipe(
      tap(() => this.menuChanges.next()),
    );
  }

  deleteMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/menu/${id}`).pipe(
      tap(() => this.menuChanges.next()),
    );
  }

  bulkDelete(ids: number[]): Observable<BulkDeleteResult> {
    return this.http.delete<BulkDeleteResult>(`${API_BASE_URL}/menu/bulk-delete`, {
      body: ids,
    }).pipe(tap(() => this.menuChanges.next()));
  }

  private normalizeMenuTree(menus: MenuItem[]): MenuItem[] {
    return menus.map((menu) => ({
      ...menu,
      children: this.normalizeMenuTree(menu.children ?? []),
    }));
  }
}
