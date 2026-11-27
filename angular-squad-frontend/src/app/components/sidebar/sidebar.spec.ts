import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Sidebar } from './sidebar';
import { MenuService } from '../../services/menu.service';
import { AuthService } from '../../services/auth.service';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { clearSession: () => undefined } },
        {
          provide: MenuService,
          useValue: {
            getMenus: () => of([
              {
                id: 1,
                menu_name: 'Dashboard',
                url_menu: '/dashboard',
                parent_id: 0,
                is_active: 1,
                children: [],
              },
              {
                id: 2,
                menu_name: 'Master Data',
                url_menu: '',
                parent_id: 0,
                is_active: 1,
                children: [
                  {
                    id: 3,
                    menu_name: 'Data Barang',
                    url_menu: '/data-barang',
                    parent_id: 2,
                    is_active: 1,
                    children: [
                      {
                        id: 4,
                        menu_name: 'CRUD Features',
                        url_menu: '/crud-features',
                        parent_id: 3,
                        is_active: 1,
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu entries and their nested links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dashboard');
    const dashboardLink = [...compiled.querySelectorAll<HTMLAnchorElement>('a')]
      .find((link) => link.textContent?.includes('Dashboard'));
    const dashboardHost = dashboardLink?.closest('app-sidebar-menu-item');
    expect(dashboardHost?.classList.contains('submenu-host')).toBeFalse();
    expect(dashboardHost?.classList.contains('submenu-open')).toBeFalse();
    expect(dashboardHost?.querySelector('.right')).toBeFalsy();
    expect(compiled.textContent).toContain('Master Data');
    const masterHost = compiled.querySelector('#menu-children-2')?.closest('app-sidebar-menu-item');
    expect(masterHost?.classList.contains('submenu-host')).toBeTrue();
    expect(compiled.querySelector('#menu-children-2')?.getAttribute('aria-hidden')).toBe('false');

    const masterToggle = masterHost?.querySelector<HTMLButtonElement>('.submenu-toggle');
    expect(masterToggle?.getAttribute('aria-expanded')).toBe('true');
    masterToggle?.click();
    fixture.detectChanges();

    expect(masterToggle?.getAttribute('aria-expanded')).toBe('false');
    expect(compiled.querySelector('#menu-children-2')?.getAttribute('aria-hidden')).toBe('true');

    masterToggle?.click();
    fixture.detectChanges();
    expect(compiled.textContent).toContain('CRUD Features');
  });
});
