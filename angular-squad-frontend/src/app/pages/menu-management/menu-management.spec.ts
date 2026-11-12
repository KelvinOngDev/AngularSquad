import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MenuManagement } from './menu-management';
import { MenuService } from '../../services/menu.service';

describe('MenuManagement', () => {
  let fixture: ComponentFixture<MenuManagement>;
  let menuService: jasmine.SpyObj<MenuService>;

  beforeEach(async () => {
    menuService = jasmine.createSpyObj<MenuService>('MenuService', [
      'getAllMenus',
      'createMenu',
      'updateMenu',
      'deleteMenu',
      'bulkDelete',
    ]);
    menuService.getAllMenus.and.returnValue(of([
      {
        id: 2,
        menu_name: 'Master Data',
        url_menu: '',
        parent_id: 0,
        is_active: 1,
        children: [],
      },
      {
        id: 3,
        menu_name: 'Data Barang',
        url_menu: '/data-barang',
        parent_id: 2,
        is_active: 1,
        children: [],
      },
      {
        id: 1,
        menu_name: 'CRUD Features',
        url_menu: '/crud-features',
        parent_id: 0,
        is_active: 1,
        children: [],
      },
      ...Array.from({ length: 9 }, (_, index) => ({
        id: index + 4,
        menu_name: `Other Menu ${index + 1}`,
        url_menu: `/other-${index + 1}`,
        parent_id: 0,
        is_active: 1,
        children: [],
      })),
    ]));

    await TestBed.configureTestingModule({
      imports: [MenuManagement],
      providers: [{ provide: MenuService, useValue: menuService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuManagement);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('loads records from the menu table', () => {
    expect(menuService.getAllMenus).toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('CRUD Features');
  });

  it('reveals each child parent selector when a parent is selected', () => {
    const element = fixture.nativeElement as HTMLElement;
    const rootParentSelect = element.querySelector<HTMLSelectElement>('[name="parent-level-0"]');
    expect(rootParentSelect).toBeTruthy();
    expect(element.querySelector('[name="parent-level-1"]')).toBeNull();

    const masterDataOption = Array.from(rootParentSelect!.options)
      .find((option) => option.textContent?.trim() === 'Master Data');
    expect(masterDataOption).toBeTruthy();
    rootParentSelect!.value = masterDataOption!.value;
    rootParentSelect!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const childParentSelect = element.querySelector<HTMLSelectElement>('[name="parent-level-1"]');
    expect(childParentSelect).toBeTruthy();
    expect(Array.from(childParentSelect!.options)
      .some((option) => option.textContent?.trim() === 'Data Barang')).toBeTrue();
  });

  it('selects and deselects all menu rows', () => {
    const element = fixture.nativeElement as HTMLElement;
    const selectAll = element.querySelector<HTMLInputElement>(
      '[aria-label="Select all menus on this page"]',
    )!;

    selectAll.checked = true;
    selectAll.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(selectAll.checked).toBeTrue();
    expect(element.querySelectorAll('tbody input[type="checkbox"]:checked').length).toBe(10);
    expect(element.textContent).toContain('Delete Selected (10)');

    const firstRow = element.querySelector<HTMLInputElement>('[aria-label="Select Master Data"]')!;
    firstRow.checked = false;
    firstRow.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(selectAll.checked).toBeFalse();
    expect(element.querySelectorAll('tbody input[type="checkbox"]:checked').length).toBe(9);
    expect(element.textContent).toContain('Delete Selected (9)');
  });

  it('confirms bulk deletion, clears selection, and reloads the table', () => {
    const element = fixture.nativeElement as HTMLElement;
    const confirm = spyOn(window, 'confirm').and.returnValue(true);
    menuService.bulkDelete.and.returnValue(of({
      message: '10 menu(s) deleted successfully.',
      deletedCount: 10,
    }));

    const selectAll = element.querySelector<HTMLInputElement>(
      '[aria-label="Select all menus on this page"]',
    )!;
    selectAll.checked = true;
    selectAll.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const deleteButton = Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Delete Selected (10)'));
    deleteButton?.click();
    fixture.detectChanges();

    expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete 10 selected items?');
    expect(menuService.bulkDelete).toHaveBeenCalledWith([2, 3, 1, 4, 5, 6, 7, 8, 9, 10]);
    expect(menuService.getAllMenus).toHaveBeenCalledTimes(2);
    expect(element.querySelector('[aria-label="Select all menus on this page"]')?.getAttribute('checked'))
      .toBeNull();
    expect(element.textContent).not.toContain('Delete Selected (');
  });

  it('filters menus and offers autocomplete suggestions', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const search = element.querySelector<HTMLInputElement>('#menu-search')!;

    search.value = 'Mas';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const suggestion = Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Master Data'));
    expect(suggestion).toBeTruthy();
    expect(element.textContent).toContain('Menampilkan 1–2 dari 2 menu');

    suggestion!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(search.value).toBe('Master Data');
    expect(element.textContent).toContain('Master Data');
    expect(element.textContent).toContain('Data Barang');
  });

  it('changes the page size and navigates pagination', () => {
    const element = fixture.nativeElement as HTMLElement;
    const pageSize = element.querySelector<HTMLSelectElement>('[aria-label="Items per page"]')!;
    const fiveItemsOption = Array.from(pageSize.options).find((option) => option.textContent === '5')!;
    pageSize.value = fiveItemsOption.value;
    pageSize.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.querySelectorAll('tbody tr input[type="checkbox"]').length).toBe(5);
    expect(element.textContent).toContain('Menampilkan 1–5 dari 12 menu');
    expect(element.textContent).toContain('Page 1 of 3');

    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Next')!
      .click();
    fixture.detectChanges();

    expect(element.querySelectorAll('tbody tr input[type="checkbox"]').length).toBe(5);
    expect(element.textContent).toContain('Menampilkan 6–10 dari 12 menu');
    expect(element.textContent).toContain('Page 2 of 3');
  });
});
