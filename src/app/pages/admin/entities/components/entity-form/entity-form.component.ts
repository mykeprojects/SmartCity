import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Entity } from 'src/app/models/territorial/entity';
import { EntityFormPayload } from 'src/app/models/admin/entity-form-payload';
import { showImagePreview, territorialImageUrl } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-entity-form',
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
  templateUrl: './entity-form.component.html',
})
export class EntityFormComponent implements OnInit {
  @Input() entity?: Entity;
  @Output() formSubmit = new EventEmitter<EntityFormPayload>();

  form!: FormGroup;
  isEditMode = false;

  logoPreviewUrl = '';
  private logoFile?: File;

  get f() {
    return this.form.controls;
  }

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.isEditMode = !!this.entity;

    this.form = this.fb.group({
      name: [this.entity?.name ?? '', [Validators.required, Validators.maxLength(160)]],
      nit: [this.entity?.nit ?? '', [Validators.maxLength(40)]],
      phone: [this.entity?.phone ?? '', [Validators.maxLength(40)]],
      email: [this.entity?.email ?? '', [Validators.email, Validators.maxLength(160)]],
      address: [this.entity?.address ?? '', [Validators.maxLength(255)]],
      status: [this.entity?.status ?? 'active', [Validators.required]],
    });

    this.logoPreviewUrl = territorialImageUrl(this.entity?.logo_url);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.logoFile = file;
    this.logoPreviewUrl = URL.createObjectURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = { ...this.form.value };
    value.name = (value.name as string)?.trim();
    value.email = (value.email as string)?.trim();
    value.nit = (value.nit as string)?.trim();
    value.phone = (value.phone as string)?.trim();
    value.address = (value.address as string)?.trim();

    this.formSubmit.emit({ entity: value, logoFile: this.logoFile });
  }

  onCancel(): void {
    this.form.reset();
    this.router.navigate(['/admin/entities/list']);
  }

  previewLogo(): void {
    if (this.logoPreviewUrl) {
      showImagePreview(this.logoPreviewUrl, 'Logo de entidad');
    }
  }
}

