import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CitizenFormComponent } from '../components/citizen-form/citizen-form.component';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { Citizen } from 'src/app/models/territorial/citizen';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-citizen-create',
  standalone: true,
  imports: [CitizenFormComponent],
  template: '<app-citizen-form (formSubmit)="onCreate($event)" />',
})
export class CitizenCreateComponent {
  constructor(private router: Router, private citizenService: CitizenService) {}

  onCreate(data: Partial<Citizen>): void {
    this.citizenService.create(data).subscribe({
      next: () => {
        showSuccess('Registrado', 'Ciudadano creado correctamente.');
        this.router.navigate(['/admin/citizens/list']);
      },
      error: (err) => showApiError(err),
    });
  }
}
