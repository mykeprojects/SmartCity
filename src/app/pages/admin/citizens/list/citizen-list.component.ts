import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { DynamicTableComponent } from 'src/app/components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from 'src/app/models/component-dynamic-table/column-def';
import { TablePageEvent } from 'src/app/models/component-dynamic-table/table-page-event';
import { Citizen } from 'src/app/models/territorial/citizen';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { ADMIN_TABLE_ACTIONS } from '../../shared/admin-table-actions';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-citizen-list',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, MatButtonModule],
  templateUrl: './citizen-list.component.html',
})
export class CitizenListComponent implements OnInit {
  citizens: Citizen[] = [];
  loading = false;
  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;

  columns: ColumnDef[] = [
    { header: 'ID', key: 'id_citizen' },
    { header: 'Nombre', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Celular', key: 'phone' },
    { header: 'Dirección', key: 'address' },
  ];
  actions = ADMIN_TABLE_ACTIONS;

  constructor(private citizenService: CitizenService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.citizenService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        this.citizens = resp.items || [];
        this.page = resp.page || page;
        this.pageSize = resp.pageSize || pageSize;
        this.total = resp.totalItems ?? 0;
        this.totalPages = resp.totalPages ?? 1;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        showApiError(err);
      },
    });
  }

  onPageChange(e: TablePageEvent): void {
    this.page = e.page;
    this.pageSize = e.pageSize;
    this.load(this.page, this.pageSize);
  }

  onTableAction(event: { actionId: string; row: Citizen }): void {
    const id = event.row.id_citizen;
    if (!id) return;
    if (event.actionId === 'view') this.router.navigate([`/admin/citizens/detail/${id}`]);
    else if (event.actionId === 'edit') this.router.navigate([`/admin/citizens/update/${id}`]);
    else if (event.actionId === 'delete') {
      Swal.fire({
        title: '¿Eliminar ciudadano?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
      }).then((r) => {
        if (!r.isConfirmed) return;
        this.citizenService.delete(id).subscribe({
          next: () => {
            showSuccess('Eliminado');
            this.load();
          },
          error: (err) => showApiError(err),
        });
      });
    }
  }

  goCreate(): void {
    this.router.navigate(['/admin/citizens/create']);
  }
}
