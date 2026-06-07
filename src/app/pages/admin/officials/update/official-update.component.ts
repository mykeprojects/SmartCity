import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Official } from 'src/app/models/territorial/official';
import { OfficialService } from 'src/app/services/territorial/official.service';
import { OfficialFormComponent } from '../components/official-form/official-form.component';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-official-update',
  standalone: true,
  imports: [OfficialFormComponent],
  template: `@if (official) {
    <app-official-form [official]="official" (formSubmit)="onUpdate($event)" />
  } @else { <p>Cargando...</p> }`,
})
export class OfficialUpdateComponent implements OnInit {
  official?: Official;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private officialService: OfficialService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.id)) {
      this.router.navigate(['/admin/officials/list']);
      return;
    }
    this.officialService.getById(this.id).subscribe({
      next: (o) => (this.official = o),
      error: () => this.router.navigate(['/admin/officials/list']),
    });
  }

  onUpdate(data: Partial<Official>): void {
    this.officialService.update(this.id, data).subscribe({
      next: () => {
        showSuccess('Actualizado');
        this.router.navigate(['/admin/officials/list']);
      },
      error: (err) => showApiError(err),
    });
  }
}
