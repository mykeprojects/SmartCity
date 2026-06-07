import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Entity } from 'src/app/models/territorial/entity';
import { Official } from 'src/app/models/territorial/official';
import { EntityService } from 'src/app/services/territorial/entity.service';
import { OfficialService } from 'src/app/services/territorial/official.service';
import {
  formatOfficialRole,
  isPagedResponse,
  showApiError,
} from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-entity-officials',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './entity-officials.component.html',
  styleUrl: './entity-officials.component.scss',
})
export class EntityOfficialsComponent implements OnInit {
  entity?: Entity;
  entityOfficials: Official[] = [];
  loadingEntity = false;
  loadingOfficials = false;
  private entityId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entityService: EntityService,
    private officialService: OfficialService
  ) {}

  ngOnInit(): void {
    this.entityId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.entityId)) {
      this.router.navigate(['/admin/entities/list']);
      return;
    }
    this.loadEntity();
    this.loadEntityOfficials();
  }

  private loadEntity(): void {
    this.loadingEntity = true;
    this.entityService.getById(this.entityId).subscribe({
      next: (entity) => {
        this.entity = entity;
        this.loadingEntity = false;
      },
      error: () => this.router.navigate(['/admin/entities/list']),
    });
  }

  loadEntityOfficials(): void {
    this.loadingOfficials = true;
    this.officialService.search(1, 500, { id_entity: String(this.entityId) }).subscribe({
      next: (resp) => {
        this.entityOfficials = isPagedResponse<Official>(resp) ? resp.items : [];
        this.loadingOfficials = false;
      },
      error: (err) => {
        this.loadingOfficials = false;
        showApiError(err, 'No se pudieron cargar los funcionarios de la entidad.');
      },
    });
  }

  createOfficial(): void {
    this.router.navigate(['/admin/officials/create'], {
      queryParams: {
        entityId: this.entityId,
        returnUrl: `/admin/entities/${this.entityId}/officials`,
      },
    });
  }

  editOfficial(official: Official): void {
    if (!official.id_official) return;
    this.router.navigate([`/admin/officials/update/${official.id_official}`], {
      queryParams: { returnUrl: `/admin/entities/${this.entityId}/officials` },
    });
  }

  back(): void {
    this.router.navigate(['/admin/entities/list']);
  }

  formatRole(role: string): string {
    return formatOfficialRole(role);
  }
}
