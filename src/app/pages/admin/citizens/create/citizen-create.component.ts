import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CitizenFormComponent } from '../components/citizen-form/citizen-form.component';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { Citizen } from 'src/app/models/territorial/citizen';
import { UserRegistrationPayload } from 'src/app/models/user-registration';
import { showApiError, showSuccess, extractFirebaseErrorMessage } from 'src/app/services/territorial/territorial-api.util';
import { SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-citizen-create',
  standalone: true,
  imports: [CitizenFormComponent],
  template: '<app-citizen-form (createSubmit)="onCreate($event)" />',
})
export class CitizenCreateComponent {
  saving = false;

  constructor(
    private router: Router,
    private citizenService: CitizenService,
    private securityService: SecurityService
  ) {}

  onCreate(payload: UserRegistrationPayload<Citizen>): void {
    if (this.saving) return;
    this.saving = true;

    const email = payload.data.email!;
    this.securityService
      .registerUser(email, payload.password, payload.data.name)
      .then(() => {
        this.citizenService.create(payload.data).subscribe({
          next: () => {
            this.saving = false;
            showSuccess('Registrado', 'Ciudadano creado correctamente.');
            this.router.navigate(['/admin/citizens/list']);
          },
          error: (err) => {
            this.securityService.deleteRegisteredUser(email, payload.password).finally(() => {
              this.saving = false;
              showApiError(err, 'No se pudo registrar el ciudadano. Verifique que el correo no esté en uso.');
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
