import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Commune } from 'src/app/models/territorial/commune';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';
import { NeighborhoodService } from 'src/app/services/territorial/neighborhood.service';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { NeighborhoodFormComponent } from '../components/neighborhood-form/neighborhood-form.component';

@Component({
  selector: 'app-update-neighborhood',
  standalone: true,
  imports: [NeighborhoodFormComponent],
  templateUrl: './update-neighborhood.component.html',
  styleUrl: './update-neighborhood.component.scss'
})
export class UpdateNeighborhoodComponent implements OnInit {
  comunas: Commune[] = [];
  barrioAEditar?: Neighborhood;
  idNeighborhood!: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute, // Para leer el ID de la URL
    private neighborhoodService: NeighborhoodService,
    private communeService: CommuneService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idNeighborhood = Number(idParam);
      this.cargarInformacionInicial();
    } else {
      this.regresar();
    }
  }

  cargarInformacionInicial(): void {
    // 2. Ejecutar ambas peticiones en paralelo o secuencial
    this.communeService.getAll().subscribe({
      next: (comunasData) => {
        this.comunas = comunasData;
        
        // 3. Una vez cargadas las comunas, buscamos los datos del barrio
        this.neighborhoodService.getById(this.idNeighborhood).subscribe({
          next: (barrioData) => {
            this.barrioAEditar = barrioData;
          },
          error: (err) => console.error('Error al obtener el barrio:', err)
        });
      },
      error: (err) => console.error('Error al obtener comunas:', err)
    });
  }

  procesarActualizacion(formValue: Neighborhood): void {
    console.log('Enviando actualización al servidor:', formValue);

    this.neighborhoodService.update(this.idNeighborhood, formValue).subscribe({
      next: () => {
        this.router.navigate(['/neighborhood']);
      },
      error: (err) => {
        console.error('Error al actualizar el barrio:', err);
      }
    });
  }

  regresar(): void {
    this.router.navigate(['/neighborhood']);
  }
}
