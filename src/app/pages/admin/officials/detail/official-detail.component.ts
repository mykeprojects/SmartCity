import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Official } from 'src/app/models/territorial/official';
import { OfficialService } from 'src/app/services/territorial/official.service';
import { EntityService } from 'src/app/services/territorial/entity.service';

@Component({
  selector: 'app-official-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="cardWithShadow theme-card p-6" *ngIf="official">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Detalle del funcionario</h2>
        <button mat-flat-button color="primary" (click)="back()">Volver</button>
      </div>
      <div class="mt-4 space-y-2">
        <p><b>Nombre:</b> {{ official.name }}</p>
        <p><b>Email:</b> {{ official.email }}</p>
        <p><b>Celular:</b> {{ official.phone || '-' }}</p>
        <p><b>Rol:</b> {{ official.role }}</p>
        <p><b>Entidad:</b> {{ entityName }}</p>
        <p><b>Estado:</b> {{ official.status }}</p>
      </div>
    </div>
    <p *ngIf="!official">Cargando...</p>
  `,
})
export class OfficialDetailComponent implements OnInit {
  official?: Official;
  entityName = '-';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private officialService: OfficialService,
    private entityService: EntityService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.router.navigate(['/admin/officials/list']);
      return;
    }
    this.officialService.getById(id).subscribe({
      next: (o) => {
        this.official = o;
        this.entityService.getById(o.id_entity).subscribe({
          next: (e) => (this.entityName = e.name),
        });
      },
      error: () => this.router.navigate(['/admin/officials/list']),
    });
  }

  back(): void {
    this.router.navigate(['/admin/officials/list']);
  }
}
