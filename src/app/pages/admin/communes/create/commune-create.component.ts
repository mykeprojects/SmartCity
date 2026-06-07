import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommuneFormComponent } from '../components/commune-form/commune-form.component';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { Commune } from 'src/app/models/territorial/commune';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-commune-create',
  standalone: true,
  imports: [CommuneFormComponent],
  template: '<app-commune-form (formSubmit)="onCreate($event)" />',
})
export class CommuneCreateComponent {
  constructor(private router: Router, private communeService: CommuneService) {}

  onCreate(data: Partial<Commune>): void {
    this.communeService.create(data).subscribe({
      next: () => {
        showSuccess('Creado', 'Comuna registrada.');
        this.router.navigate(['/admin/communes/list']);
      },
      error: (err) =>
        showApiError(err, 'No se pudo registrar la comuna. Verifique que el nombre no esté duplicado en la ciudad.'),
    });
  }
}
