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
                children: [],
              },
              {
                id: 2,
                menu_name: 'Master Data',
                url_menu: '',
                parent_id: 0,
                children: [
                  {
                    id: 3,
                    menu_name: 'Data Barang',
                    url_menu: '/data-barang',
                    parent_id: 2,
                    children: [
                      {
                        id: 4,
                        menu_name: 'CRUD Features',
                        url_menu: '/crud-features',
                        parent_id: 3,
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
    expect(compiled.textContent).toContain('Master Data');
    expect(compiled.querySelector('#menu-children-2')?.getAttribute('aria-hidden')).toBe('true');

    const masterDataButton = compiled.querySelector<HTMLButtonElement>(
      'button[aria-label="Expand Master Data"]',
    );
    masterDataButton?.click();
    fixture.detectChanges();

    expect(masterDataButton?.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelector('#menu-children-2')?.getAttribute('aria-hidden')).toBe('false');
    const dataBarangButton = compiled.querySelector<HTMLButtonElement>(
      'button[aria-label="Expand Data Barang"]',
    );
    expect(dataBarangButton).toBeTruthy();
    expect(compiled.querySelector('#menu-children-3')?.getAttribute('aria-hidden')).toBe('true');

    dataBarangButton?.click();
    fixture.detectChanges();

    expect(dataBarangButton?.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelector('#menu-children-3')?.getAttribute('aria-hidden')).toBe('false');
    expect(compiled.textContent).toContain('CRUD Features');
  });
});
