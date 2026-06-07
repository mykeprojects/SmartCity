import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Citizen } from 'src/app/models/territorial/citizen';
import { MapPickerComponent, MapLocation } from 'src/app/components/map/map-picker.component';

@Component({
  selector: 'app-citizen-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MapPickerComponent,
  ],
  templateUrl: './citizen-form.component.html',
})
export class CitizenFormComponent implements OnInit {
  @Input() citizen?: Citizen;
  @Output() formSubmit = new EventEmitter<Partial<Citizen>>();

  form!: FormGroup;
  isEditMode = false;
  latitude?: number;
  longitude?: number;

  get f() {
    return this.form.controls;
  }

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.isEditMode = !!this.citizen;
    this.latitude = this.citizen?.latitude ?? 5.0703;
    this.longitude = this.citizen?.longitude ?? -75.5138;

    this.form = this.fb.group({
      name: [this.citizen?.name ?? '', Validators.required],
      email: [this.citizen?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.citizen?.phone ?? ''],
      address: [this.citizen?.address ?? ''],
      status: [this.citizen?.status ?? 'active', Validators.required],
      latitude: [this.latitude, Validators.required],
      longitude: [this.longitude, Validators.required],
    });
  }

  onLocationChange(loc: MapLocation): void {
    this.latitude = loc.latitude;
    this.longitude = loc.longitude;
    this.form.patchValue({ latitude: loc.latitude, longitude: loc.longitude });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.formSubmit.emit(this.form.value);
  }

  onCancel(): void {
    this.router.navigate(['/admin/citizens/list']);
  }
}
