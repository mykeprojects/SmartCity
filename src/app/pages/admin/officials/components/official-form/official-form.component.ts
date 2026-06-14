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
import { UserRegistrationPayload } from 'src/app/models/user-registration';
import { Entity } from 'src/app/models/territorial/entity';
import { EntityService } from 'src/app/services/territorial/entity.service';
import { OFFICIAL_ROLES } from 'src/app/services/territorial/territorial-api.util';

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
  @Input() presetEntityId?: number;
  @Input() entityLocked = false;
  @Input() cancelUrl = '/admin/officials/list';
  @Output() formSubmit = new EventEmitter<Partial<Official>>();
  @Output() createSubmit = new EventEmitter<UserRegistrationPayload<Official>>();

  form!: FormGroup;
  isEditMode = false;
  entities: Entity[] = [];
  presetEntityName = '';

  readonly roles = OFFICIAL_ROLES;

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
    const initialEntityId = this.official?.id_entity ?? this.presetEntityId ?? null;

    if (!this.entityLocked) {
      this.entityService.getAll().subscribe({
        next: (items) => (this.entities = Array.isArray(items) ? items : []),
      });
    } else if (initialEntityId) {
      this.entityService.getById(initialEntityId).subscribe({
        next: (entity) => (this.presetEntityName = entity.name),
      });
    }

    this.form = this.fb.group({
      name: [this.official?.name ?? '', [Validators.required, Validators.maxLength(160)]],
      email: [this.official?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.official?.phone ?? '', [Validators.maxLength(40)]],
      role: [this.official?.role ?? 'official', [Validators.required]],
      id_entity: [{ value: initialEntityId, disabled: this.entityLocked }, [Validators.required]],
      status: [this.official?.status ?? 'active', [Validators.required]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', this.isEditMode ? [] : [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = { ...this.form.getRawValue() };
    value.name = (value.name as string)?.trim();
    value.email = (value.email as string)?.trim();
    value.phone = (value.phone as string)?.trim();

    if (!this.isEditMode) {
      const password = (value.password as string) ?? '';
      const confirmPassword = (value.confirmPassword as string) ?? '';
      if (password !== confirmPassword) {
        this.form.get('confirmPassword')?.setErrors({ mismatch: true });
        return;
      }

      const { password: _password, confirmPassword: _confirmPassword, ...data } = value;
      this.createSubmit.emit({ data, password });
      return;
    }

    const { password: _password, confirmPassword: _confirmPassword, ...data } = value;
    this.formSubmit.emit(data);
  }

  onCancel(): void {
    this.router.navigateByUrl(this.cancelUrl);
  }
}
