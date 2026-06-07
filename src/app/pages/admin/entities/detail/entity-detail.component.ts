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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entityService: EntityService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (isNaN(id)) {
      this.router.navigate(['/admin/entities/list']);
      return;
    }

    this.entityService.getById(id).subscribe({
      next: (e) => {
        this.entity = e;
        this.logoUrl = territorialImageUrl(e.logo_url);
      },
      error: () => this.router.navigate(['/admin/entities/list']),
    });
  }

  back(): void {
    this.router.navigate(['/admin/entities/list']);
  }
}

