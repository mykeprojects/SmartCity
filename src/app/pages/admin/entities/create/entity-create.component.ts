import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { EntityFormComponent, EntityFormPayload } from '../components/entity-form/entity-form.component';
import { EntityService } from 'src/app/services/territorial/entity.service';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-entity-create',
  standalone: true,
  imports: [EntityFormComponent],
  templateUrl: './entity-create.component.html',
  styleUrl: './entity-create.component.scss',
})
export class EntityCreateComponent {
  constructor(private router: Router, private entityService: EntityService) {}

  onCreate(payload: EntityFormPayload): void {
    this.entityService.create(payload.entity, payload.logoFile).subscribe({
      next: () => {
        showSuccess('Creado', 'La entidad fue creada correctamente.');
        this.router.navigate(['/admin/entities/list']);
      },
      error: (err) => showApiError(err, 'No se pudo crear la entidad.'),
    });
  }
}

