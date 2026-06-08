import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfficialFormComponent } from '../components/official-form/official-form.component';
import { OfficialService } from 'src/app/services/territorial/official.service';
import { Official } from 'src/app/models/territorial/official';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-official-create',
  standalone: true,
  imports: [OfficialFormComponent],
  template: `
    <app-official-form
      [presetEntityId]="presetEntityId"
      [entityLocked]="entityLocked"
      [cancelUrl]="cancelUrl"
      (formSubmit)="onCreate($event)" />
  `,
})
export class OfficialCreateComponent implements OnInit {
  presetEntityId?: number;
  entityLocked = false;
  cancelUrl = '/admin/officials/list';
  private successUrl = '/admin/officials/list';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private officialService: OfficialService
  ) {}

  ngOnInit(): void {
    const entityIdParam = this.route.snapshot.queryParamMap.get('entityId');
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (entityIdParam) {
      const entityId = Number(entityIdParam);
      if (!isNaN(entityId)) {
        this.presetEntityId = entityId;
        this.entityLocked = true;
        this.cancelUrl = returnUrl || `/admin/entities/detail/${entityId}`;
        this.successUrl = this.cancelUrl;
      }
    }
  }

  onCreate(data: Partial<Official>): void {
    this.officialService.create(data).subscribe({
      next: () => {
        showSuccess('Creado', 'Funcionario registrado correctamente.');
        this.router.navigateByUrl(this.successUrl);
      },
      error: (err) => showApiError(err, 'No se pudo registrar el funcionario.'),
    });
  }
}
