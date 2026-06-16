import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeighborhoodService } from 'src/app/services/territorial/neighborhood.service';
import { PointService } from 'src/app/services/territorial/point.service';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { AnnotationService } from 'src/app/services/territorial/annotation.service';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';
import { DynamicTableComponent } from 'src/app/components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from 'src/app/models/component-dynamic-table/column-def';
import { ADMIN_TABLE_ACTIONS } from 'src/app/pages/admin/shared/admin-table-actions';
import { TablePageEvent } from 'src/app/models/component-dynamic-table/table-page-event';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Point } from 'src/app/models/territorial/point';
import { NeighborhoodToTable } from 'src/app/models/territorial/neighboorhoodToTable';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  neighborhoods: Neighborhood[] = [];
  neighborhoodsToList: NeighborhoodToTable[] = [];
  loading = false;

  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;

  // 1. CORRECCIÓN: Mapeo exacto de llaves con las propiedades de NeighborhoodToTable
  columns: ColumnDef[] = [
    {header: 'Barrio', key: 'name'},
    {header: 'Comuna', key: 'commune'},        // <- Cambiado de 'id_commune' a 'commune'
    {header: 'Puntos', key: 'points'},
    {header: 'Anotaciones', key: 'annotations'}, // <- Cambiado de 'Annotations' a 'annotations'
    {header: 'Estado', key: 'status'}
  ]

  actions = ADMIN_TABLE_ACTIONS.filter((action) => action.id !== 'view');

  constructor(private neighborhoodService: NeighborhoodService, 
              private router: Router,
              private pointService: PointService,
              private communeService: CommuneService,
              private annotationService: AnnotationService
  ){}

  ngOnInit(): void {
    this.loadNeighborhoods();
  }

  loadNeighborhoods(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.neighborhoodService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        this.neighborhoods = resp.items || [];
        this.page = resp.page || page;
        this.pageSize = resp.pageSize || pageSize;
        this.total = resp.totalItems ?? this.neighborhoods.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading = false;
        this.loadInfoFromNeighborhoods();
      },
      error: () => {
        this.neighborhoods = [];
        this.neighborhoodsToList = [];
        this.total = 0;
        this.totalPages = 1;
        this.loading = false;
      }
    });
  }

  loadInfoFromNeighborhoods() {
    this.neighborhoodsToList = [];

    this.neighborhoods.forEach(neighborhood => {
      const id = neighborhood.id_neighborhood ?? 0;
      const idCommune = neighborhood.id_commune ?? 0;

      forkJoin({
        pointsResp: this.pointService.searchByFilter(id),
        annotationsResp: this.annotationService.searchFilter({id_neighborhood: id}),
        communeResp: this.communeService.getById(idCommune)
      }).subscribe({
        next: ({pointsResp, annotationsResp, communeResp}) => {
          const pointsArray = Array.isArray(pointsResp) ? pointsResp : (pointsResp.items || []);
          const annotationsArray = Array.isArray(annotationsResp) ? annotationsResp : [];
          
          this.neighborhoodsToList.push({
            id_neighborhood: neighborhood.id_neighborhood, 
            name: neighborhood.name,
            points: pointsArray.length,
            annotations: annotationsArray.length,
            commune: communeResp?.name || "Sin comuna",
            status: neighborhood.status // Asegúrate de heredar el estado para la columna
          })
        }
      })
    })
  }

  onPageChange(event: TablePageEvent): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.loadNeighborhoods(this.page, this.pageSize);
  }

  // 2. CORRECCIÓN: El tipo de 'row' pasa a ser NeighborhoodToTable
  onTableAction(event: { actionId: String, row: NeighborhoodToTable}): void {
    const { actionId, row } = event;
    if (actionId === 'edit'){
      this.router.navigate([`/neighborhood/edit/${row.id_neighborhood}`]);
      console.log("Editar", row);
    } else if (actionId === 'delete'){
      this.delete(row);
    }
  }

  irACrearBarrio(): void {
    this.router.navigate(['/neighborhood/create']);
  }

  // 3. CORRECCIÓN: Ajustado el parámetro para interactuar con la fila de la tabla mapeada
  delete(neighborhood: NeighborhoodToTable): void {
    Swal.fire({
      title: '¿Estás Seguro?',
      text: `¿Quieres eliminar el barrio "${neighborhood.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if(result.isConfirmed){
        this.neighborhoodService.delete(neighborhood.id_neighborhood ?? 0).subscribe({
          next: () => {
            Swal.fire('Eliminado', `El barrio "${neighborhood.name}" ha sido eliminado`, 'success');
            this.loadNeighborhoods(); // Agregados los paréntesis () que faltaban
          }
        });
      }
    });
  }
}
