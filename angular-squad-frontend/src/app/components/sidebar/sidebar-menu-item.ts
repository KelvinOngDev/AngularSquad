import { Component, forwardRef, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../services/menu.service';

@Component({
  selector: 'app-sidebar-menu-item',
  imports: [RouterLink, RouterLinkActive, forwardRef(() => SidebarMenuItem)],
  templateUrl: './sidebar-menu-item.html',
  styleUrl: './sidebar-menu-item.css',
})
export class SidebarMenuItem {
  readonly menu = input.required<MenuItem>();
  protected readonly expanded = signal(false);

  protected toggle(): void {
    this.expanded.update((isExpanded) => !isExpanded);
  }
}
