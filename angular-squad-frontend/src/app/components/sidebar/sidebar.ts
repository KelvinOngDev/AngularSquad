import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MenuItem, MenuService } from '../../services/menu.service';
import { AuthService } from '../../services/auth.service';
import { SidebarMenuItem } from './sidebar-menu-item';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, SidebarMenuItem],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: {
    class: 'd-block h-100',
  },
})
export class Sidebar implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly menuService = inject(MenuService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly menus = signal<MenuItem[]>([]);
  protected readonly loadError = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly rootMenus = computed(() => this.menus());

  ngOnInit(): void {
    this.menuService
      .getMenus()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (menus) => {
          this.menus.set(menus);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to load sidebar menus.', error);
          this.loadError.set('Menu tidak dapat dimuat. Periksa koneksi ke API.');
          this.isLoading.set(false);
        },
      });
  }

  protected logout(): void {
    this.auth.clearSession();
    void this.router.navigateByUrl('/login');
  }
}