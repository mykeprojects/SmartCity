import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Commune } from 'src/app/models/territorial/commune';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';
import { NeighborhoodService } from 'src/app/services/territorial/neighborhood.service';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { NeighborhoodFormComponent } from '../components/neighborhood-form/neighborhood-form.component';
import Swal from 'sweetalert2';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { isPagedResponse } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [NeighborhoodFormComponent],
  templateUrl: './create-neighborhood.component.html',
  styleUrl: './create-neighborhood.component.scss',
})
export class CreateNeighborhoodComponent implements OnInit {
  comunas: Commune[] = []; 
  barrios: Neighborhood[] = [];

  constructor(
    private router: Router,
    private neighborhoodService: NeighborhoodService,
    private communeService: CommuneService // 4. Inyecta el servicio de comunas
  ) { }

  ngOnInit(): void {
    this.cargarComunas();
  }

  cargarComunas(): void {
    this.communeService.getAll().subscribe({
      next: (data: Commune[]) => {
        this.comunas = data;
        console.log('Comunas cargadas correctamente:', this.comunas);
      },
      error: (err) => {
        console.error('Error al obtener las comunas del servidor:', err);
      }
    });
  }

  procesarGuardado(formValue: Omit<Neighborhood, "id_neighborhood">): void {
    this.neighborhoodService.create(formValue).subscribe({
      next: () => this.router.navigate(['/neighborhood']),
      error: (err) => {
        const mensajeError = err?.error?.message || err?.message || 'No se pudo crear el barrio.';
        this.neighborhoodService.searchByFilter(formValue.id_commune).subscribe({
          next: (barriosActualizados) => {
            this.barrios = (isPagedResponse(barriosActualizados)) ? barriosActualizados.items : barriosActualizados;

            const elBarrioYaExiste = this.barrios.some(
              (barrio) => barrio.name.toLowerCase().trim() === formValue.name.toLowerCase().trim() // Tip: toLowerCase evita fallos por mayúsculas
            );
            if (elBarrioYaExiste) {
              Swal.fire({
                icon: 'error',
                title: '¡Ups! Algo salió mal',
                text: `Ya existe un barrio con el nombre "${formValue.name}" en esta comuna.`,
                buttonsStyling: false,
                customClass: {
                  popup: 'rounded-2xl bg-white p-6 shadow-2xl max-w-sm border border-gray-100',
                  title: 'text-xl font-bold text-gray-800 mt-3',
                  htmlContainer: 'text-sm text-gray-500 mt-2 font-medium leading-relaxed',
                  confirmButton: 'w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-red-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                },
                confirmButtonText: 'Entendido'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: '¡Ups! Algo salió mal',
                text: mensajeError,
                buttonsStyling: false,
                customClass: {
                  popup: 'rounded-2xl bg-white p-6 shadow-2xl max-w-sm border border-gray-100',
                  title: 'text-xl font-bold text-gray-800 mt-3',
                  htmlContainer: 'text-sm text-gray-500 mt-2 font-medium leading-relaxed',
                  confirmButton: 'w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-red-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                },
                confirmButtonText: 'Entendido'
              });
            }
          },
          error: (errorCarga) => {
            console.error('Error al verificar los barrios duplicados:', errorCarga);
          }
        });
      }
    });
  }

  regresar(): void {
    this.router.navigate(['/neighborhood']);
  }
}
