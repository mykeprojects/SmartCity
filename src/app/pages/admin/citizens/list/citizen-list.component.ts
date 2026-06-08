import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DynamicTableComponent } from 'src/app/components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from 'src/app/models/component-dynamic-table/column-def';
import { TablePageEvent } from 'src/app/models/component-dynamic-table/table-page-event';
import { Citizen } from 'src/app/models/territorial/citizen';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { DeleteValidationService } from 'src/app/services/territorial/delete-validation.service';
import { ADMIN_TABLE_ACTIONS } from '../../shared/admin-table-actions';
import { showApiError, showDeleteBlocked, showSuccess } from 'src/app/services/territorial/territorial-api.util';
import { MapMarker, MapPickerComponent } from 'src/app/components/map/map-picker.component';

type CitizenRow = Citizen & { statusLabel: string };

@Component({
  selector: 'app-citizen-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MapPickerComponent,
  ],
  templateUrl: './citizen-list.component.html',
})
export class CitizenListComponent implements OnInit {
  citizens: CitizenRow[] = [];
  mapMarkers: MapMarker[] = [];
  loading = false;
  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;
  searchQuery = '';

  columns: ColumnDef[] = [
    { header: 'Nombre', key: 'name' },
    { header: 'Correo', key: 'email' },
    { header: 'Celular', key: 'phone' },
    { header: 'Dirección', key: 'address' },
    { header: 'Estado', key: 'statusLabel' },
  ];
  actions = ADMIN_TABLE_ACTIONS;

  constructor(
    private citizenService: CitizenService,
    private deleteValidation: DeleteValidationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    const request$ = this.searchQuery.trim()
      ? this.citizenService.search(page, pageSize, { q: this.searchQuery.trim() })
      : this.citizenService.getPaged(page, pageSize);

    request$.subscribe({
      next: (resp) => {
        this.citizens = (resp.items || []).map((citizen) => ({
          ...citizen,
          statusLabel: this.formatStatus(citizen.status),
        }));
        this.mapMarkers = this.citizens
          .filter((c) => c.latitude != null && c.longitude != null)
          .map((c) => ({
            latitude: c.latitude!,
            longitude: c.longitude!,
            label: `${c.name}${c.address ? `<br>${c.address}` : ''}`,
          }));
        this.page = resp.page || page;
        this.pageSize = resp.pageSize || pageSize;
        this.total = resp.totalItems ?? 0;
        this.totalPages = resp.totalPages ?? 1;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        showApiError(err, 'No se pudieron cargar los ciudadanos.');
      },
    });
  }

  onSearch(): void {
    this.page = 1;
    this.load(1, this.pageSize);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  onPageChange(e: TablePageEvent): void {
    this.page = e.page;
    this.pageSize = e.pageSize;
    this.load(this.page, this.pageSize);
  }

  onTableAction(event: { actionId: string; row: CitizenRow }): void {
    const id = event.row.id_citizen;
    if (!id) return;
    if (event.actionId === 'view') this.router.navigate([`/admin/citizens/detail/${id}`]);
    else if (event.actionId === 'edit') this.router.navigate([`/admin/citizens/update/${id}`]);
    else if (event.actionId === 'delete') this.confirmDelete(event.row);
  }

  goCreate(): void {
    this.router.navigate(['/admin/citizens/create']);
  }

  private confirmDelete(citizen: CitizenRow): void {
    if (!citizen.id_citizen) return;

    this.deleteValidation.checkCitizenDeletion(citizen.id_citizen).subscribe({
      next: (check) => {
        if (!check.canDelete) {
          showDeleteBlocked('No se puede eliminar el ciudadano', check.blockers);
          return;
        }

        Swal.fire({
          title: '¿Eliminar ciudadano?',
          text: `Se eliminará "${citizen.name}". Esta acción no se puede deshacer.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        }).then((r) => {
          if (!r.isConfirmed) return;
          this.citizenService.delete(citizen.id_citizen!).subscribe({
            next: () => {
              showSuccess('Eliminado', 'Ciudadano eliminado correctamente.');
              this.load();
            },
            error: (err) => showApiError(err, 'No se pudo eliminar el ciudadano.'),
          });
        });
      },
    });
  }

  private formatStatus(status: string): string {
    if (status === 'active') return 'Activo';
    if (status === 'inactive') return 'Inactivo';
    return status;
  }
}
