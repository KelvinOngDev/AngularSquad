import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { MenuItem } from '../../services/menu.service';

@Component({
  selector: 'app-sidebar-menu-item',
  imports: [RouterLink, RouterLinkActive, SidebarMenuItem],
  templateUrl: './sidebar-menu-item.html',
  styleUrl: './sidebar-menu-item.css',
  host: {
    class: 'block w-full',
  },
})
export class SidebarMenuItem implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly menu = input.required<MenuItem>();
  protected readonly expanded = signal(false);
  protected readonly hasChildren = computed(() => (this.menu().children?.length ?? 0) > 0);

  protected readonly iconClass = computed(() => {
    const menu = this.menu();
    const route = (menu.url_menu ?? '').toLowerCase();
    const name = (menu.menu_name ?? '').toLowerCase();

    if (route === '/dashboard' || name.includes('dashboard')) return 'fas fa-tachometer-alt';
    if (route.includes('barang') || name.includes('barang')) return 'fas fa-boxes';
    if (route.includes('user') || name.includes('user') || name.includes('pengguna')) return 'fas fa-users';
    if (route.includes('menu') || name.includes('menu')) return 'fas fa-list';
    if (route.includes('setting') || name.includes('pengaturan') || name.includes('setting')) return 'fas fa-cog';
    if (route.includes('chat') || name.includes('chat') || name.includes('pesan')) return 'fas fa-comments';
    if (route.includes('signalr') || name.includes('signalr') || name.includes('realtime')) return 'fas fa-broadcast-tower';
    if (route.includes('notification') || name.includes('notifikasi')) return 'fas fa-bell';
    if (route.includes('dokter') || name.includes('dokter')) return 'fas fa-user-md';
    if (route.includes('patient') || name.includes('pasien')) return 'fas fa-procedures';
    if (route.includes('master') || name.includes('master')) return 'fas fa-layer-group';
    if (this.hasChildren()) return 'fas fa-folder-open';

    const fallbacks = ['fas fa-file-alt', 'fas fa-clipboard', 'fas fa-file-invoice', 'fas fa-cube', 'fas fa-bookmark'];
    return fallbacks[Math.abs(menu.id ?? 0) % fallbacks.length];
  });

  ngOnInit(): void {
    this.syncExpandedWithRoute();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncExpandedWithRoute());
  }

  protected toggle(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.expanded.update((value) => !value);
  }

  private syncExpandedWithRoute(): void {
    if (this.hasActiveDescendant(this.menu())) {
      this.expanded.set(true);
    }
  }

  private hasActiveDescendant(item: MenuItem): boolean {
    if (!item.children?.length) return false;

    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    return item.children.some((child) => {
      const childUrl = child.url_menu?.trim();
      const isMatch =
        !!childUrl && (currentUrl === childUrl || currentUrl.startsWith(`${childUrl}/`));
      return isMatch || this.hasActiveDescendant(child);
    });
  }
}