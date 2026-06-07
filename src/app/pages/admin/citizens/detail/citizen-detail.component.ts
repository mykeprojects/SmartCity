import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Citizen } from 'src/app/models/territorial/citizen';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { MapPickerComponent } from 'src/app/components/map/map-picker.component';

@Component({
  selector: 'app-citizen-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MapPickerComponent],
  template: `
    <div class="cardWithShadow theme-card p-6" *ngIf="citizen">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Detalle del ciudadano</h2>
        <button mat-flat-button color="primary" (click)="back()">Volver</button>
      </div>
      <div class="mt-4 space-y-2">
        <p><b>Nombre:</b> {{ citizen.name }}</p>
        <p><b>Email:</b> {{ citizen.email }}</p>
        <p><b>Celular:</b> {{ citizen.phone || '-' }}</p>
        <p><b>Dirección:</b> {{ citizen.address || '-' }}</p>
        <p><b>Coordenadas:</b> {{ citizen.latitude }}, {{ citizen.longitude }}</p>
      </div>
      <div class="mt-4">
        <app-map-picker [latitude]="citizen.latitude" [longitude]="citizen.longitude" [readonly]="true"></app-map-picker>
      </div>
    </div>
    <p *ngIf="!citizen">Cargando...</p>
  `,
})
export class CitizenDetailComponent implements OnInit {
  citizen?: Citizen;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citizenService: CitizenService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.router.navigate(['/admin/citizens/list']);
      return;
    }
    this.citizenService.getById(id).subscribe({
      next: (c) => (this.citizen = c),
      error: () => this.router.navigate(['/admin/citizens/list']),
    });
  }

  back(): void {
    this.router.navigate(['/admin/citizens/list']);
  }
}
