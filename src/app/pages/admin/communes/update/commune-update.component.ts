import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Commune } from 'src/app/models/territorial/commune';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { CommuneFormComponent } from '../components/commune-form/commune-form.component';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-commune-update',
  standalone: true,
  imports: [CommuneFormComponent],
  template: `@if (commune) {
    <app-commune-form [commune]="commune" (formSubmit)="onUpdate($event)" />
  } @else { <p>Cargando...</p> }`,
})
export class CommuneUpdateComponent implements OnInit {
  commune?: Commune;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communeService: CommuneService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.id)) {
      this.router.navigate(['/admin/communes/list']);
      return;
    }
    this.communeService.getById(this.id).subscribe({
      next: (c) => (this.commune = c),
      error: () => this.router.navigate(['/admin/communes/list']),
    });
  }

  onUpdate(data: Partial<Commune>): void {
    this.communeService.update(this.id, data).subscribe({
      next: () => {
        showSuccess('Actualizado');
        this.router.navigate(['/admin/communes/list']);
      },
      error: (err) => showApiError(err),
    });
  }
}
