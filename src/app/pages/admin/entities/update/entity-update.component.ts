import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Entity } from 'src/app/models/territorial/entity';
import { EntityService } from 'src/app/services/territorial/entity.service';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';
import { EntityFormComponent, EntityFormPayload } from '../components/entity-form/entity-form.component';

@Component({
  selector: 'app-entity-update',
  standalone: true,
  imports: [EntityFormComponent],
  templateUrl: './entity-update.component.html',
  styleUrl: './entity-update.component.scss',
})
export class EntityUpdateComponent implements OnInit {
  entity?: Entity;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entityService: EntityService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : NaN;
    if (isNaN(this.id)) {
      this.router.navigate(['/admin/entities/list']);
      return;
    }

    this.entityService.getById(this.id).subscribe({
      next: (e) => (this.entity = e),
      error: () => this.router.navigate(['/admin/entities/list']),
    });
  }

  onUpdate(payload: EntityFormPayload): void {
    this.entityService.update(this.id, payload.entity, payload.logoFile).subscribe({
      next: () => {
        showSuccess('Actualizado', 'La entidad fue actualizada correctamente.');
        this.router.navigate(['/admin/entities/list']);
      },
      error: (err) => showApiError(err, 'No se pudo actualizar la entidad.'),
    });
  }
}

