import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { DynamicTableComponent } from 'src/app/components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from 'src/app/models/component-dynamic-table/column-def';
import { TablePageEvent } from 'src/app/models/component-dynamic-table/table-page-event';
import { Official } from 'src/app/models/territorial/official';
import { Entity } from 'src/app/models/territorial/entity';
import { OfficialService } from 'src/app/services/territorial/official.service';
import { EntityService } from 'src/app/services/territorial/entity.service';
import { DeleteValidationService } from 'src/app/services/territorial/delete-validation.service';
import { ADMIN_TABLE_ACTIONS } from '../../shared/admin-table-actions';
import {
  formatOfficialRole,
  OFFICIAL_ROLES,
  showApiError,
  showDeleteBlocked,
  showSuccess,
} from 'src/app/services/territorial/territorial-api.util';

type OfficialRow = Official & { entityName: string; roleLabel: string };

@Component({
  selector: 'app-official-list',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './official-list.component.html',
})
export class OfficialListComponent implements OnInit {
  officials: OfficialRow[] = [];
  entities: Entity[] = [];
  loading = false;
  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;
  filterEntityId: number | null = null;
  filterRole = '';
  readonly roles = OFFICIAL_ROLES;
  private entityMap = new Map<number, string>();

  columns: ColumnDef[] = [
    { header: 'Nombre', key: 'name' },
    { header: 'Correo', key: 'email' },
    { header: 'Rol', key: 'roleLabel' },
    { header: 'Entidad', key: 'entityName' },
  ];
  actions = ADMIN_TABLE_ACTIONS;

  constructor(
    private officialService: OfficialService,
    private entityService: EntityService,
    private deleteValidation: DeleteValidationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.entityService.getAll().subscribe({
      next: (entities) => {
        this.entities = Array.isArray(entities) ? entities : [];
        this.entityMap.clear();
        this.entities.forEach((e) => {
          if (e.id_entity) this.entityMap.set(e.id_entity, e.name);
        });
        this.loadOfficials();
      },
      error: () => this.loadOfficials(),
    });
  }

  loadOfficials(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    const hasFilters = this.filterEntityId != null || !!this.filterRole;
    const request$ = hasFilters
      ? this.officialService.search(page, pageSize, this.buildSearchFilters())
      : this.officialService.getPaged(page, pageSize);

    request$.subscribe({
      next: (resp) => {
        this.officials = (resp.items || []).map((o) => this.toRow(o));
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

  onFilterChange(): void {
    this.page = 1;
    this.loadOfficials(1, this.pageSize);
  }

  clearFilters(): void {
    this.filterEntityId = null;
    this.filterRole = '';
    this.onFilterChange();
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

  private buildSearchFilters(): Record<string, string> {
    const filters: Record<string, string> = {};
    if (this.filterEntityId != null) {
      filters['id_entity'] = String(this.filterEntityId);
    }
    if (this.filterRole) {
      filters['role'] = this.filterRole;
    }
    return filters;
  }

  private toRow(o: Official): OfficialRow {
    return {
      ...o,
      roleLabel: formatOfficialRole(o.role),
      entityName: o.id_entity
        ? this.entityMap.get(o.id_entity) || `ID ${o.id_entity}`
        : 'Sin entidad',
    };
  }

  private confirmDelete(official: OfficialRow): void {
    if (!official.id_official) return;

    this.deleteValidation.checkOfficialDeletion().subscribe({
      next: (check) => {
        if (!check.canDelete) {
          showDeleteBlocked('No se puede eliminar el funcionario', check.blockers);
          return;
        }

        Swal.fire({
          title: '¿Eliminar funcionario?',
          text: `Se eliminará "${official.name}". Esta acción no se puede deshacer.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        }).then((r) => {
          if (!r.isConfirmed) return;
          this.officialService.delete(official.id_official!).subscribe({
            next: () => {
              showSuccess('Eliminado', 'Funcionario eliminado correctamente.');
              this.loadOfficials();
            },
            error: (err) => showApiError(err, 'No se pudo eliminar el funcionario.'),
          });
        });
      },
    });
  }
}
