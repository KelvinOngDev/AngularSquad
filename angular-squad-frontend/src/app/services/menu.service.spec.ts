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
        is_active: 1,
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

  it('sends selected IDs in the bulk-delete request body', () => {
    const ids = [2, 4, 7];
    const response = { message: '3 menu(s) deleted successfully.', deletedCount: 3 };

    service.bulkDelete(ids).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne('https://localhost:7001/api/menu/bulk-delete');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual(ids);
    request.flush(response);
  });

  it('notifies the sidebar after a menu is deleted', () => {
    let menuChanged = false;
    service.menuChanges$.subscribe(() => {
      menuChanged = true;
    });

    service.deleteMenu(4).subscribe();

    const request = httpTesting.expectOne('https://localhost:7001/api/menu/4');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(menuChanged).toBeTrue();
  });
});
