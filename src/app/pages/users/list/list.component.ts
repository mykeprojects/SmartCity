import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from 'src/app/services/users.service';
import { User } from 'src/app/models/user';
import { DynamicTableComponent } from 'src/app/components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from 'src/app/models/component-dynamic-table/column-def';
import { ActionButton } from 'src/app/models/component-dynamic-table/action-button';
import { TablePageEvent } from 'src/app/models/component-dynamic-table/table-page-event';
import Swal from "sweetalert2";
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {

  users: User[] = [];
  loading = false;

  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;

  columns: ColumnDef[] = [
    { header: 'ID', key: 'id' },
    { header: 'Nombre', key: 'name' },
    { header: 'Usuario', key: 'username' },
    { header: 'Email', key: 'email' },
  ];

  actions: ActionButton[] = [
    {
      id: 'view',
      label: 'Ver',
      icon: 'heroEye',
      class: 'flex-1 px-2 py-1 rounded bg-blue-500 text-white cursor-pointer flex items-center justify-center gap-1'
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: 'heroPencil',
      class: 'flex-1 px-2 py-1 rounded bg-yellow-400 text-black cursor-pointer flex items-center justify-center gap-1'
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'heroTrash',
      class: 'flex-1 px-2 py-1 rounded bg-red-500 text-white cursor-pointer flex items-center justify-center gap-1'
    }
  ];

  constructor(private usersService: UsersService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.usersService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        this.users = resp.data || [];
        this.page = resp.page || page;
        this.pageSize = resp.pageSize || pageSize;
        this.total = resp.totalItems ?? this.users.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.total = 0;
        this.totalPages = 1;
        this.loading = false;
      }
    });
  }
  onPageChange(event: TablePageEvent): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    console.log('Página cambiada:', event);
    this.loadUsers(this.page, this.pageSize);
  }

  onTableAction(event: { actionId: string; row: User }): void {
    const { actionId, row } = event;
    // Manejar acciones desde el componente padre
    if (actionId === 'view') {
      console.log('Ver', row);
    } else if (actionId === 'edit') {
      this.router.navigate([`/users/update/${row.id}`]);
      console.log('Editar', row);
    } else if (actionId === 'delete') {
      console.log('Eliminar', row);
      this.delete(row);
    } else {
      console.log('Acción desconocida', actionId, row);
    }
  }

  delete(user: User): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.delete(user.id ? user.id : 0).subscribe({
          next: () => {
            Swal.fire('Eliminado', `El usuario "${user.name}" ha sido eliminado.`, 'success');
            this.loadUsers();
          }
        });
      }
    });
  }

}
