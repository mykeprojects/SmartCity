import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OfficialFormComponent } from '../components/official-form/official-form.component';
import { OfficialService } from 'src/app/services/territorial/official.service';
import { Official } from 'src/app/models/territorial/official';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-official-create',
  standalone: true,
  imports: [OfficialFormComponent],
  template: '<app-official-form (formSubmit)="onCreate($event)" />',
})
export class OfficialCreateComponent {
  constructor(private router: Router, private officialService: OfficialService) {}

  onCreate(data: Partial<Official>): void {
    this.officialService.create(data).subscribe({
      next: () => {
        showSuccess('Creado', 'Funcionario registrado.');
        this.router.navigate(['/admin/officials/list']);
      },
      error: (err) => showApiError(err),
    });
  }
}
