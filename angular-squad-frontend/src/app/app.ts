import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarMenuItem } from './components/sidebar/sidebar-menu-item';
import { AuthService } from './services/auth.service';
import { MenuItem, MenuService } from './services/menu.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, SidebarMenuItem],
  templateUrl: './app.html'
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly menuService = inject(MenuService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly isLoginRoute = signal(false);
  protected readonly menus = signal<MenuItem[]>([]);
  protected readonly isMenuLoading = signal(false);
  protected readonly menuError = signal<string | null>(null);
  public isSidebarCollapsed = signal<boolean>(false);

  ngOnInit(): void {
    this.updateRouteState(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.updateRouteState(event.urlAfterRedirects));

    this.menuService.menuChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isLoginRoute()) {
          this.loadMenus();
        }
      });
  }

  public toggleSidebar(event: Event): void {
    event.preventDefault();
    this.isSidebarCollapsed.update((collapsed) => !collapsed);
  }

  public toggleFullscreen(event: Event): void {
    event.preventDefault();
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }

  public logout(): void {
    this.auth.clearSession();
    void this.router.navigateByUrl('/login');
  }

  protected reloadMenus(): void {
    this.loadMenus();
  }

  private updateRouteState(url: string): void {
    const pathname = url.split(/[?#]/, 1)[0];
    const isLoginRoute = pathname === '/login';
    this.isLoginRoute.set(isLoginRoute);

    if (isLoginRoute) {
      this.menus.set([]);
      this.menuError.set(null);
      return;
    }

    this.loadMenus();
  }

  private loadMenus(): void {
    this.isMenuLoading.set(true);
    this.menuError.set(null);
    this.menuService.getMenus().subscribe({
      next: (menus) => {
        this.menus.set(menus);
        this.isMenuLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load sidebar menus.', error);
        this.menuError.set('Menu tidak dapat dimuat. Periksa sesi login dan koneksi API.');
        this.isMenuLoading.set(false);
      },
    });
  }
}