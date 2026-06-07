import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Citizen } from 'src/app/models/territorial/citizen';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { MapPickerComponent } from 'src/app/components/map/map-picker.component';

@Component({
  selector: 'app-citizen-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MapPickerComponent],
  templateUrl: './citizen-detail.component.html',
})
export class CitizenDetailComponent implements OnInit {
  citizen?: Citizen;
  statusLabel = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citizenService: CitizenService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.router.navigate(['/admin/citizens/list']);
      return;
    }
    this.citizenService.getById(id).subscribe({
      next: (c) => {
        this.citizen = c;
        this.statusLabel = this.formatStatus(c.status);
      },
      error: () => this.router.navigate(['/admin/citizens/list']),
    });
  }

  back(): void {
    this.router.navigate(['/admin/citizens/list']);
  }

  edit(): void {
    if (this.citizen?.id_citizen) {
      this.router.navigate([`/admin/citizens/update/${this.citizen.id_citizen}`]);
    }
  }

  private formatStatus(status: string): string {
    if (status === 'active') return 'Activo';
    if (status === 'inactive') return 'Inactivo';
    return status;
  }
}
