import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Commune } from 'src/app/models/territorial/commune';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';
import { NeighborhoodService } from 'src/app/services/territorial/neighborhood.service';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { NeighborhoodFormComponent } from '../components/neighborhood-form/neighborhood-form.component';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [NeighborhoodFormComponent],
  templateUrl: './create-neighborhood.component.html',
  styleUrl: './create-neighborhood.component.scss',
})
export class CreateNeighborhoodComponent implements OnInit {
  comunas: Commune[] = []; 

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
      error: (err) => console.error('Error al crear el barrio:', err)
    });
  }

  regresar(): void {
    this.router.navigate(['/neighborhood']);
  }
}
