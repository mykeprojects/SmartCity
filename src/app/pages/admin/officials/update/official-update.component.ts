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
    <app-official-form
      [official]="official"
      [cancelUrl]="cancelUrl"
      (formSubmit)="onUpdate($event)" />
  } @else { <p>Cargando...</p> }`,
})
export class OfficialUpdateComponent implements OnInit {
  official?: Official;
  cancelUrl = '/admin/officials/list';
  private id!: number;
  private successUrl = '/admin/officials/list';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private officialService: OfficialService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.cancelUrl = returnUrl;
      this.successUrl = returnUrl;
    }

    if (isNaN(this.id)) {
      this.router.navigate(['/admin/officials/list']);
      return;
    }
    this.officialService.getById(this.id).subscribe({
      next: (o) => (this.official = o),
      error: () => this.router.navigateByUrl(this.cancelUrl),
    });
  }

  onUpdate(data: Partial<Official>): void {
    this.officialService.update(this.id, data).subscribe({
      next: () => {
        showSuccess('Actualizado', 'Funcionario actualizado correctamente.');
        this.router.navigateByUrl(this.successUrl);
      },
      error: (err) => showApiError(err, 'No se pudo actualizar el funcionario.'),
    });
  }
}
