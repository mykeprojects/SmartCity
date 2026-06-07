import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Citizen } from 'src/app/models/territorial/citizen';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { CitizenFormComponent } from '../components/citizen-form/citizen-form.component';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-citizen-update',
  standalone: true,
  imports: [CitizenFormComponent],
  template: `@if (citizen) {
    <app-citizen-form [citizen]="citizen" (formSubmit)="onUpdate($event)" />
  } @else { <p>Cargando...</p> }`,
})
export class CitizenUpdateComponent implements OnInit {
  citizen?: Citizen;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citizenService: CitizenService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.id)) {
      this.router.navigate(['/admin/citizens/list']);
      return;
    }
    this.citizenService.getById(this.id).subscribe({
      next: (c) => (this.citizen = c),
      error: () => this.router.navigate(['/admin/citizens/list']),
    });
  }

  onUpdate(data: Partial<Citizen>): void {
    this.citizenService.update(this.id, data).subscribe({
      next: () => {
        showSuccess('Actualizado');
        this.router.navigate(['/admin/citizens/list']);
      },
      error: (err) => showApiError(err),
    });
  }
}
