import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { DynamicTableComponent } from 'src/app/components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from 'src/app/models/component-dynamic-table/column-def';
import { TablePageEvent } from 'src/app/models/component-dynamic-table/table-page-event';
import { Commune } from 'src/app/models/territorial/commune';
import { City } from 'src/app/models/territorial/city';
import { Department } from 'src/app/models/territorial/department';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { CityService } from 'src/app/services/territorial/city.service';
import { DepartmentService } from 'src/app/services/territorial/department.service';
import { ADMIN_TABLE_ACTIONS } from '../../shared/admin-table-actions';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

type CommuneRow = Commune & { cityName?: string; departmentName?: string };

@Component({
  selector: 'app-commune-list',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, MatButtonModule],
  templateUrl: './commune-list.component.html',
})
export class CommuneListComponent implements OnInit {
  communes: CommuneRow[] = [];
  loading = false;
  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;

  private cityMap = new Map<number, City>();
  private departmentMap = new Map<number, Department>();

  columns: ColumnDef[] = [
    { header: 'ID', key: 'id_commune' },
    { header: 'Comuna', key: 'name' },
    { header: 'Ciudad', key: 'cityName' },
    { header: 'Departamento', key: 'departmentName' },
    { header: 'Estado', key: 'status' },
  ];
  actions = ADMIN_TABLE_ACTIONS.filter((a) => a.id !== 'view');

  constructor(
    private communeService: CommuneService,
    private cityService: CityService,
    private departmentService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: (deps) => {
        (Array.isArray(deps) ? deps : []).forEach((d) => this.departmentMap.set(d.id_department, d));
        this.load();
      },
      error: () => this.load(),
    });
  }

  load(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.communeService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        const items = resp.items || [];
        items.forEach((c) => {
          if (c.id_city && !this.cityMap.has(c.id_city)) {
            this.cityService.getById(c.id_city).subscribe({
              next: (city) => {
                this.cityMap.set(city.id_city, city);
                this.enrichRows();
              },
            });
          }
        });
        this.communes = this.mapRows(items);
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

  private enrichRows(): void {
    this.communes = this.mapRows(this.communes);
  }

  private mapRows(items: Commune[]): CommuneRow[] {
    return items.map((c) => {
      const city = this.cityMap.get(c.id_city);
      const dept = city ? this.departmentMap.get(city.id_department) : undefined;
      return {
        ...c,
        cityName: city?.name || `Ciudad #${c.id_city}`,
        departmentName: dept?.name || '-',
      };
    });
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
    else if (event.actionId === 'delete') {
      Swal.fire({
        title: '¿Eliminar comuna?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
      }).then((r) => {
        if (!r.isConfirmed) return;
        this.communeService.delete(id).subscribe({
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
    this.router.navigate(['/admin/communes/create']);
  }
}
