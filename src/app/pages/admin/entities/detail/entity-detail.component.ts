import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Entity } from 'src/app/models/territorial/entity';
import { EntityService } from 'src/app/services/territorial/entity.service';
import { territorialImageUrl } from 'src/app/services/territorial/territorial-api.util';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-entity-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './entity-detail.component.html',
  styleUrl: './entity-detail.component.scss',
})
export class EntityDetailComponent implements OnInit {
  entity?: Entity;
  logoUrl = '';
  statusLabel = '';
  private entityId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entityService: EntityService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.entityId = idParam ? Number(idParam) : NaN;
    if (isNaN(this.entityId)) {
      this.router.navigate(['/admin/entities/list']);
      return;
    }

    this.entityService.getById(this.entityId).subscribe({
      next: (e) => {
        this.entity = e;
        this.logoUrl = territorialImageUrl(e.logo_url);
        this.statusLabel = e.status === 'active' ? 'Activo' : e.status === 'inactive' ? 'Inactivo' : e.status;
      },
      error: () => this.router.navigate(['/admin/entities/list']),
    });
  }

  back(): void {
    this.router.navigate(['/admin/entities/list']);
  }

  edit(): void {
    if (this.entity?.id_entity) {
      this.router.navigate([`/admin/entities/update/${this.entity.id_entity}`]);
    }
  }

  viewOfficials(): void {
    this.router.navigate([`/admin/entities/${this.entityId}/officials`]);
  }
}
