import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Official } from 'src/app/models/territorial/official';
import { Entity } from 'src/app/models/territorial/entity';
import { EntityService } from 'src/app/services/territorial/entity.service';

@Component({
  selector: 'app-official-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './official-form.component.html',
})
export class OfficialFormComponent implements OnInit {
  @Input() official?: Official;
  @Output() formSubmit = new EventEmitter<Partial<Official>>();

  form!: FormGroup;
  isEditMode = false;
  entities: Entity[] = [];

  readonly roles = [
    { value: 'official', label: 'Funcionario' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Administrador' },
  ];

  get f() {
    return this.form.controls;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private entityService: EntityService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.official;
    this.entityService.getAll().subscribe({
      next: (items) => (this.entities = Array.isArray(items) ? items : []),
    });

    this.form = this.fb.group({
      name: [this.official?.name ?? '', [Validators.required, Validators.maxLength(160)]],
      email: [this.official?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.official?.phone ?? '', [Validators.maxLength(40)]],
      role: [this.official?.role ?? 'official', [Validators.required]],
      id_entity: [this.official?.id_entity ?? null, [Validators.required]],
      status: [this.official?.status ?? 'active', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.formSubmit.emit(this.form.value);
  }

  onCancel(): void {
    this.router.navigate(['/admin/officials/list']);
  }
}
