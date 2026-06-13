import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfficialFormComponent } from '../components/official-form/official-form.component';
import { OfficialService } from 'src/app/services/territorial/official.service';
import { Official } from 'src/app/models/territorial/official';
import { UserRegistrationPayload } from 'src/app/models/user-registration';
import { showApiError, showSuccess, extractFirebaseErrorMessage } from 'src/app/services/territorial/territorial-api.util';
import { SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-official-create',
  standalone: true,
  imports: [OfficialFormComponent],
  template: `
    <app-official-form
      [presetEntityId]="presetEntityId"
      [entityLocked]="entityLocked"
      [cancelUrl]="cancelUrl"
      (createSubmit)="onCreate($event)" />
  `,
})
export class OfficialCreateComponent implements OnInit {
  presetEntityId?: number;
  entityLocked = false;
  cancelUrl = '/admin/officials/list';
  private successUrl = '/admin/officials/list';
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private officialService: OfficialService,
    private securityService: SecurityService
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

  onCreate(payload: UserRegistrationPayload<Official>): void {
    if (this.saving) return;
    this.saving = true;

    const email = payload.data.email!;
    this.securityService
      .registerUser(email, payload.password, payload.data.name)
      .then(() => {
        this.officialService.create(payload.data).subscribe({
          next: () => {
            this.saving = false;
            showSuccess('Creado', 'Funcionario registrado correctamente.');
            this.router.navigateByUrl(this.successUrl);
          },
          error: (err) => {
            this.securityService.deleteRegisteredUser(email, payload.password).finally(() => {
              this.saving = false;
              showApiError(err, 'No se pudo registrar el funcionario.');
            });
          },
        });
      })
      .catch((err) => {
        this.saving = false;
        showApiError(err, extractFirebaseErrorMessage(err));
      });
  }
}
