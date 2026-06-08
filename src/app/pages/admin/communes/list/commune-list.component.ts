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
import { Commune } from 'src/app/models/territorial/commune';
import { City } from 'src/app/models/territorial/city';
import { Department } from 'src/app/models/territorial/department';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { CityService } from 'src/app/services/territorial/city.service';
import { DepartmentService } from 'src/app/services/territorial/department.service';
import { DeleteValidationService } from 'src/app/services/territorial/delete-validation.service';
import { ADMIN_TABLE_ACTIONS } from '../../shared/admin-table-actions';
import { showApiError, showDeleteBlocked, showSuccess } from 'src/app/services/territorial/territorial-api.util';

type CommuneRow = Commune & { cityName: string; departmentName: string; statusLabel: string };

@Component({
  selector: 'app-commune-list',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './commune-list.component.html',
})
export class CommuneListComponent implements OnInit {
  communes: CommuneRow[] = [];
  departments: Department[] = [];
  filterCities: City[] = [];
  loading = false;
  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;
  filterDepartmentId: number | null = null;
  filterCityId: number | null = null;

  private cityMap = new Map<number, City>();
  private departmentMap = new Map<number, Department>();

  columns: ColumnDef[] = [
    { header: 'Comuna', key: 'name' },
    { header: 'Ciudad', key: 'cityName' },
    { header: 'Departamento', key: 'departmentName' },
    { header: 'Estado', key: 'statusLabel' },
  ];
  actions = ADMIN_TABLE_ACTIONS.filter((a) => a.id !== 'view');

  constructor(
    private communeService: CommuneService,
    private cityService: CityService,
    private departmentService: DepartmentService,
    private deleteValidation: DeleteValidationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: (deps) => {
        this.departments = Array.isArray(deps) ? deps : [];
        this.departments.forEach((d) => this.departmentMap.set(d.id_department, d));
      },
    });
    this.cityService.getAll().subscribe({
      next: (cities) => {
        cities.forEach((c) => this.cityMap.set(c.id_city, c));
        this.load();
      },
      error: () => this.load(),
    });
  }

  load(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    const hasCityFilter = this.filterCityId != null;
    const request$ = hasCityFilter
      ? this.communeService.search(page, pageSize, { id_city: String(this.filterCityId) })
      : this.communeService.getPaged(page, pageSize);

    request$.subscribe({
      next: (resp) => {
        let items = resp.items || [];
        if (this.filterDepartmentId != null && !hasCityFilter) {
          items = items.filter((c) => {
            const city = this.cityMap.get(c.id_city);
            return city?.id_department === this.filterDepartmentId;
          });
        }
        this.communes = this.mapRows(items);
        this.page = resp.page || page;
        this.pageSize = resp.pageSize || pageSize;
        this.total = hasCityFilter || this.filterDepartmentId != null
          ? this.communes.length
          : (resp.totalItems ?? 0);
        this.totalPages = resp.totalPages ?? 1;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        showApiError(err, 'No se pudieron cargar las comunas.');
      },
    });
  }

  onDepartmentFilterChange(deptId: number | null): void {
    this.filterDepartmentId = deptId;
    this.filterCityId = null;
    this.filterCities = [];
    if (deptId) {
      this.cityService.getByDepartment(deptId).subscribe({
        next: (cities) => (this.filterCities = cities),
      });
    }
    this.page = 1;
    this.load(1, this.pageSize);
  }

  onCityFilterChange(cityId: number | null): void {
    this.filterCityId = cityId;
    this.page = 1;
    this.load(1, this.pageSize);
  }

  clearFilters(): void {
    this.filterDepartmentId = null;
    this.filterCityId = null;
    this.filterCities = [];
    this.page = 1;
    this.load(1, this.pageSize);
  }

  onPageChange(e: TablePageEvent): void {
    this.page = e.page;
    this.pageSize = e.pageSize;
    this.load(this.page, this.pageSize);
  }

  onTableAction(event: { actionId: string; row: CommuneRow }): void {
    const id = event.row.id_commune;
    if (!id) return;
    if (event.actionId === 'edit') this.router.navigate([`/admin/communes/update/${id}`]);
    else if (event.actionId === 'delete') this.confirmDelete(event.row);
  }

  goCreate(): void {
    this.router.navigate(['/admin/communes/create']);
  }

  private confirmDelete(commune: CommuneRow): void {
    if (!commune.id_commune) return;

    this.deleteValidation.checkCommuneDeletion(commune.id_commune).subscribe({
      next: (check) => {
        if (!check.canDelete) {
          showDeleteBlocked('No se puede eliminar la comuna', check.blockers);
          return;
        }

        Swal.fire({
          title: '¿Eliminar comuna?',
          text: `Se eliminará "${commune.name}". Esta acción no se puede deshacer.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        }).then((r) => {
          if (!r.isConfirmed) return;
          this.communeService.delete(commune.id_commune!).subscribe({
            next: () => {
              showSuccess('Eliminado', 'Comuna eliminada correctamente.');
              this.load();
            },
            error: (err) => showApiError(err, 'No se pudo eliminar la comuna.'),
          });
        });
      },
    });
  }

  private mapRows(items: Commune[]): CommuneRow[] {
    return items.map((c) => {
      const city = this.cityMap.get(c.id_city);
      const dept = city ? this.departmentMap.get(city.id_department) : undefined;
      return {
        ...c,
        cityName: city?.name || `Ciudad #${c.id_city}`,
        departmentName: dept?.name || '-',
        statusLabel: this.formatStatus(c.status),
      };
    });
  }

  private formatStatus(status: string): string {
    if (status === 'active') return 'Activo';
    if (status === 'inactive') return 'Inactivo';
    return status;
  }
}
