import { Component } from '@angular/core';

@Component({
  selector: 'app-user-management',
  imports: [],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement {
  protected readonly users = [
    { id: 1, nama: 'Administrator', username: 'admin', email: 'admin@example.com' },
    { id: 2, nama: 'Pengguna Demo', username: 'demo', email: 'demo@example.com' },
  ];
}
