import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem, MenuService, MenuWrite } from '../../services/menu.service';

interface MenuForm {
  menu_name: string;
  url_menu: string;
  parent_id: number;
  is_active: number;
}

interface ParentLevel {
  options: MenuItem[];
  selectedId: number | null;
}

const EMPTY_FORM: MenuForm = {
  menu_name: '',
  url_menu: '',
  parent_id: 0,
  is_active: 1,
};

@Component({
  selector: 'app-menu-management',
  imports: [FormsModule],
  templateUrl: './menu-management.html',
})
export class MenuManagement implements OnInit {
  private readonly menuService = inject(MenuService);
  protected readonly menus = signal<MenuItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly parentPath = signal<number[]>([]);
  protected readonly parentLevels = signal<ParentLevel[]>([]);
  protected readonly selectedIds = signal<Set<number>>(new Set());
  protected readonly isDeletingSelected = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly suggestionsOpen = signal(false);
  protected readonly pageSize = signal(10);
  protected readonly currentPage = signal(1);
  protected readonly pageSizeOptions = [5, 10, 25, 50];
  protected readonly suggestions = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    if (query.length === 0) {
      return [];
    }

    return this.menus()
      .filter((menu) =>
        menu.menu_name.toLocaleLowerCase().includes(query) ||
        menu.url_menu.toLocaleLowerCase().includes(query),
      )
      .slice(0, 6);
  });
  protected readonly filteredMenus = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    if (!query) {
      return this.menus();
    }

    return this.menus().filter((menu) =>
      menu.menu_name.toLocaleLowerCase().includes(query) ||
      menu.url_menu.toLocaleLowerCase().includes(query) ||
      this.parentName(menu.parent_id).toLocaleLowerCase().includes(query),
    );
  });
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredMenus().length / this.pageSize())),
  );
  protected readonly pageMenus = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredMenus().slice(start, start + this.pageSize());
  });
  protected readonly pageStart = computed(() =>
    this.filteredMenus().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1,
  );
  protected readonly pageEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredMenus().length),
  );
  protected readonly isAllSelected = computed(() => {
    const menus = this.pageMenus();
    return menus.length > 0 && menus.every((menu) => this.selectedIds().has(menu.id));
  });
  protected form: MenuForm = { ...EMPTY_FORM };
  protected editingId: number | null = null;

  ngOnInit(): void {
    this.loadMenus();
  }

  protected loadMenus(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.menuService.getAllMenus().subscribe({
      next: (menus) => {
        this.menus.set(menus);
        const availableIds = new Set(menus.map((menu) => menu.id));
        this.selectedIds.update((selected) => new Set(
          [...selected].filter((id) => availableIds.has(id)),
        ));
        this.clampCurrentPage();
        this.refreshParentLevels();
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load menu records.', error);
        this.errorMessage.set(this.describeError(error, 'Gagal memuat data menu.'));
        this.isLoading.set(false);
      },
    });
  }

  protected saveMenu(): void {
    if (this.isSaving()) {
      return;
    }

    const request: MenuWrite = {
      menu_name: this.form.menu_name.trim(),
      url_menu: this.form.url_menu.trim(),
      parent_id: Number(this.form.parent_id),
      is_active: Number(this.form.is_active),
    };
    if (!request.menu_name) {
      this.errorMessage.set('Nama menu wajib diisi.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const operation = this.editingId === null
      ? this.menuService.createMenu(request)
      : this.menuService.updateMenu(this.editingId, request);

    operation.subscribe({
      next: () => {
        this.successMessage.set(
          this.editingId === null ? 'Menu berhasil ditambahkan.' : 'Menu berhasil diperbarui.',
        );
        this.resetForm();
        this.isSaving.set(false);
        this.loadMenus();
      },
      error: (error: unknown) => {
        console.error('Failed to save menu record.', error);
        this.errorMessage.set(this.describeError(error, 'Gagal menyimpan menu.'));
        this.isSaving.set(false);
      },
    });
  }

  protected editMenu(menu: MenuItem): void {
    this.editingId = menu.id;
    this.parentPath.set(this.getParentPath(menu.parent_id));
    this.refreshParentLevels();
    this.form = {
      menu_name: menu.menu_name,
      url_menu: menu.url_menu,
      parent_id: menu.parent_id,
      is_active: menu.is_active,
    };
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected deleteMenu(menu: MenuItem): void {
    if (!window.confirm(`Hapus menu "${menu.menu_name}"?`)) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.menuService.deleteMenu(menu.id).subscribe({
      next: () => {
        this.successMessage.set('Menu berhasil dihapus.');
        if (this.editingId === menu.id) {
          this.resetForm();
        }
        this.loadMenus();
      },
      error: (error: unknown) => {
        console.error('Failed to delete menu record.', error);
        this.errorMessage.set(this.describeError(error, 'Gagal menghapus menu.'));
      },
    });
  }

  protected toggleSelectAll(checked: boolean): void {
    this.selectedIds.update((selected) => {
      const next = new Set(selected);
      for (const menu of this.pageMenus()) {
        if (checked) {
          next.add(menu.id);
        } else {
          next.delete(menu.id);
        }
      }
      return next;
    });
  }

  protected onSelectAllChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.toggleSelectAll(event.target.checked);
    }
  }

  protected toggleMenuSelection(id: number, checked: boolean): void {
    this.selectedIds.update((selected) => {
      const next = new Set(selected);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  protected onMenuSelectionChange(id: number, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.toggleMenuSelection(id, event.target.checked);
    }
  }

  protected onSearchChange(query: string): void {
    this.searchTerm.set(query);
    this.currentPage.set(1);
    this.suggestionsOpen.set(true);
  }

  protected selectSuggestion(menu: MenuItem): void {
    this.searchTerm.set(menu.menu_name);
    this.currentPage.set(1);
    this.suggestionsOpen.set(false);
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.suggestionsOpen.set(false);
  }

  protected setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  protected openSuggestions(): void {
    this.suggestionsOpen.set(true);
  }

  protected goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(page, 1), this.pageCount()));
  }

  protected deleteSelected(): void {
    const ids = [...this.selectedIds()];
    if (ids.length === 0 || this.isDeletingSelected()) {
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${ids.length} selected items?`)) {
      return;
    }

    this.isDeletingSelected.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.menuService.bulkDelete(ids).subscribe({
      next: (result) => {
        this.selectedIds.set(new Set());
        this.successMessage.set(result.message);
        this.isDeletingSelected.set(false);
        this.loadMenus();
      },
      error: (error: unknown) => {
        console.error('Failed to bulk delete menu records.', error);
        this.errorMessage.set(this.describeError(error, 'Gagal menghapus menu terpilih.'));
        this.isDeletingSelected.set(false);
      },
    });
  }

  protected resetForm(): void {
    this.form = { ...EMPTY_FORM };
    this.editingId = null;
    this.parentPath.set([]);
    this.refreshParentLevels();
  }

  protected selectParentLevel(level: number, selectedId: number | null): void {
    const path = this.parentPath().slice(0, level);
    if (selectedId !== null) {
      path.push(selectedId);
    }

    this.parentPath.set(path);
    this.form = { ...this.form, parent_id: path.at(-1) ?? 0 };
    this.refreshParentLevels();
  }

  protected parentName(parentId: number): string {
    if (parentId === 0) {
      return 'Menu utama';
    }
    return this.menus().find((menu) => menu.id === parentId)?.menu_name ?? 'Parent tidak ditemukan';
  }

  private describeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }
      const validationErrors = error.error?.errors;
      if (validationErrors && typeof validationErrors === 'object') {
        const messages = Object.values(validationErrors)
          .flatMap((value) => Array.isArray(value) ? value : [])
          .filter((value): value is string => typeof value === 'string');
        if (messages.length > 0) {
          return messages.join(' ');
        }
      }
      if (typeof error.error?.title === 'string') {
        return error.error.title;
      }
    }
    return fallback;
  }

  private refreshParentLevels(): void {
    const descendants = new Set<number>();
    if (this.editingId !== null) {
      descendants.add(this.editingId);
      const pending = [this.editingId];
      while (pending.length > 0) {
        const parentId = pending.pop()!;
        for (const child of this.menus().filter((menu) => menu.parent_id === parentId)) {
          if (!descendants.has(child.id)) {
            descendants.add(child.id);
            pending.push(child.id);
          }
        }
      }
    }

    const levels: ParentLevel[] = [];
    let parentId = 0;
    const path = this.parentPath();
    for (let depth = 0; depth <= path.length; depth++) {
      const options = this.menus().filter(
        (menu) => menu.parent_id === parentId && !descendants.has(menu.id),
      );
      if (depth > 0 && options.length === 0) {
        break;
      }

      const selectedId = path[depth] ?? null;
      levels.push({ options, selectedId });
      if (selectedId === null || !options.some((menu) => menu.id === selectedId)) {
        break;
      }
      parentId = selectedId;
    }
    this.parentLevels.set(levels);
  }

  private getParentPath(parentId: number): number[] {
    const path: number[] = [];
    const visited = new Set<number>();
    let currentId = parentId;
    while (currentId !== 0 && !visited.has(currentId)) {
      visited.add(currentId);
      path.unshift(currentId);
      currentId = this.menus().find((menu) => menu.id === currentId)?.parent_id ?? 0;
    }
    return path;
  }

  private clampCurrentPage(): void {
    this.currentPage.set(Math.min(this.currentPage(), this.pageCount()));
  }
}
