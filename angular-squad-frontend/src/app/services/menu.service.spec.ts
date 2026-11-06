import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { MenuService } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MenuService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(MenuService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('fetches the nested menu tree from the menu endpoint', () => {
    const response = [
      {
        id: 1,
        menu_name: 'CRUD Features',
        url_menu: '/crud-features',
        parent_id: 0,
        children: [],
      },
    ];

    service.getMenus().subscribe((menus) => {
      expect(menus).toEqual(response);
    });

    const request = httpTesting.expectOne('https://localhost:7001/api/menu');
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });
});
