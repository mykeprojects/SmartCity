import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';

import { DynamicTableComponent } from 'src/app/components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from 'src/app/models/component-dynamic-table/column-def';
import { TablePageEvent } from 'src/app/models/component-dynamic-table/table-page-event';
import { Official } from 'src/app/models/territorial/official';
import { Entity } from 'src/app/models/territorial/entity';
import { OfficialService } from 'src/app/services/territorial/official.service';
import { EntityService } from 'src/app/services/territorial/entity.service';
import { ADMIN_TABLE_ACTIONS } from '../../shared/admin-table-actions';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

type OfficialRow = Official & { entityName?: string };

@Component({
  selector: 'app-official-list',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, MatButtonModule],
  templateUrl: './official-list.component.html',
})
export class OfficialListComponent implements OnInit {
  officials: OfficialRow[] = [];
  loading = false;
  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;
  private entityMap = new Map<number, string>();

  columns: ColumnDef[] = [
    { header: 'ID', key: 'id_official' },
    { header: 'Nombre', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Entidad', key: 'entityName' },
    { header: 'Rol', key: 'role' },
  ];
  actions = ADMIN_TABLE_ACTIONS;

  constructor(
    private officialService: OfficialService,
    private entityService: EntityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.entityService.getAll().subscribe({
      next: (entities) => {
        (Array.isArray(entities) ? entities : []).forEach((e: Entity) => {
          if (e.id_entity) this.entityMap.set(e.id_entity, e.name);
        });
        this.loadOfficials();
      },
      error: () => this.loadOfficials(),
    });
  }

  loadOfficials(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.officialService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        this.officials = (resp.items || []).map((o) => ({
          ...o,
          entityName: this.entityMap.get(o.id_entity) || `ID ${o.id_entity}`,
        }));
        this.page = resp.page || page;
        this.pageSize = resp.pageSize || pageSize;
        this.total = resp.totalItems ?? this.officials.length;
        this.totalPages = resp.totalPages ?? 1;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        showApiError(err);
      },
    });
  }

  onPageChange(event: TablePageEvent): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.loadOfficials(this.page, this.pageSize);
  }

  onTableAction(event: { actionId: string; row: OfficialRow }): void {
    const id = event.row.id_official;
    if (!id) return;
    if (event.actionId === 'view') this.router.navigate([`/admin/officials/detail/${id}`]);
    else if (event.actionId === 'edit') this.router.navigate([`/admin/officials/update/${id}`]);
    else if (event.actionId === 'delete') this.confirmDelete(event.row);
  }

  goCreate(): void {
    this.router.navigate(['/admin/officials/create']);
  }

  private confirmDelete(official: OfficialRow): void {
    Swal.fire({
      title: '¿Eliminar funcionario?',
      text: `Se eliminará "${official.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (!r.isConfirmed) return;
      this.officialService.delete(official.id_official!).subscribe({
        next: () => {
          showSuccess('Eliminado');
          this.loadOfficials();
        },
        error: (err) => showApiError(err),
      });
    });
  }
}
