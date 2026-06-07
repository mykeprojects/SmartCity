import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { DynamicTableComponent } from 'src/app/components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from 'src/app/models/component-dynamic-table/column-def';
import { TablePageEvent } from 'src/app/models/component-dynamic-table/table-page-event';
import { Entity } from 'src/app/models/territorial/entity';
import { EntityService } from 'src/app/services/territorial/entity.service';
import { ADMIN_TABLE_ACTIONS } from '../../shared/admin-table-actions';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

type EntityRow = Entity & { statusLabel: string };

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, MatButtonModule, MatCardModule],
  templateUrl: './entity-list.component.html',
  styleUrl: './entity-list.component.scss',
})
export class EntityListComponent implements OnInit {
  entities: EntityRow[] = [];
  loading = false;

  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;

  columns: ColumnDef[] = [
    { header: 'ID', key: 'id_entity' },
    { header: 'Nombre', key: 'name' },
    { header: 'NIT', key: 'nit' },
    { header: 'Email', key: 'email' },
    { header: 'Estado', key: 'statusLabel' },
  ];

  actions = [
    ...ADMIN_TABLE_ACTIONS,
    {
      id: 'officials',
      label: 'Funcionarios',
      icon: 'heroUsers',
      class:
        'flex-1 px-2 py-1 rounded bg-green-600 text-white cursor-pointer flex items-center justify-center gap-1',
    },
  ];

  constructor(private entityService: EntityService, private router: Router) {}

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.entityService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        this.entities = (resp.items || []).map((entity) => ({
          ...entity,
          statusLabel: this.formatStatus(entity.status),
        }));
        this.page = resp.page || page;
        this.pageSize = resp.pageSize || pageSize;
        this.total = resp.totalItems ?? this.entities.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading = false;
      },
      error: (err) => {
        this.entities = [];
        this.total = 0;
        this.totalPages = 1;
        this.loading = false;
        showApiError(err, 'No se pudieron cargar las entidades.');
      },
    });
  }

  onPageChange(event: TablePageEvent): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.loadEntities(this.page, this.pageSize);
  }

  onTableAction(event: { actionId: string; row: EntityRow }): void {
    const { actionId, row } = event;
    const id = row.id_entity;
    if (!id) return;

    if (actionId === 'view') {
      this.router.navigate([`/admin/entities/detail/${id}`]);
    } else if (actionId === 'edit') {
      this.router.navigate([`/admin/entities/update/${id}`]);
    } else if (actionId === 'delete') {
      this.confirmDelete(row);
    } else if (actionId === 'officials') {
      this.router.navigate([`/admin/entities/${id}/officials`]);
    }
  }

  goCreate(): void {
    this.router.navigate(['/admin/entities/create']);
  }

  private formatStatus(status: string): string {
    if (status === 'active') return 'Activo';
    if (status === 'inactive') return 'Inactivo';
    return status;
  }

  private confirmDelete(entity: Entity): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar la entidad "${entity.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.entityService.delete(entity.id_entity!).subscribe({
        next: (resp) => {
          showSuccess('Eliminado', resp.message || 'La entidad fue eliminada.');
          const nextPage = this.entities.length === 1 && this.page > 1 ? this.page - 1 : this.page;
          this.loadEntities(nextPage, this.pageSize);
        },
        error: (err) => showApiError(err, 'No se pudo eliminar la entidad.'),
      });
    });
  }
}

