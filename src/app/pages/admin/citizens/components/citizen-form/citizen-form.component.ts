import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';

import { Citizen } from 'src/app/models/territorial/citizen';
import { MapPickerComponent, MapLocation } from 'src/app/components/map/map-picker.component';
import { GeocodingService } from 'src/app/services/territorial/geocoding.service';

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
  latitude = 5.0703;
  longitude = -75.5138;
  geocodeStatus: 'idle' | 'searching' | 'found' | 'not-found' = 'idle';

  private readonly destroyRef = inject(DestroyRef);

  get f() {
    return this.form.controls;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private geocodingService: GeocodingService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.citizen;
    this.latitude = this.citizen?.latitude ?? 5.0703;
    this.longitude = this.citizen?.longitude ?? -75.5138;

    this.form = this.fb.group({
      name: [this.citizen?.name ?? '', [Validators.required, Validators.maxLength(160)]],
      email: [this.citizen?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.citizen?.phone ?? '', [Validators.maxLength(40)]],
      address: [this.citizen?.address ?? '', [Validators.maxLength(255)]],
      status: [this.citizen?.status ?? 'active', Validators.required],
      latitude: [this.latitude, Validators.required],
      longitude: [this.longitude, Validators.required],
    });

    this.setupAddressGeocoding();
  }

  onLocationChange(loc: MapLocation): void {
    this.latitude = loc.latitude;
    this.longitude = loc.longitude;
    this.form.patchValue({ latitude: loc.latitude, longitude: loc.longitude }, { emitEvent: false });
    if (this.geocodeStatus === 'searching') return;
    this.geocodeStatus = 'idle';
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
    value.address = (value.address as string)?.trim();
    value.latitude = Number(value.latitude);
    value.longitude = Number(value.longitude);

    this.formSubmit.emit(value);
  }

  onCancel(): void {
    this.router.navigate(['/admin/citizens/list']);
  }

  private setupAddressGeocoding(): void {
    this.form
      .get('address')
      ?.valueChanges.pipe(
        debounceTime(800),
        distinctUntilChanged(),
        tap((address) => {
          const trimmed = (address as string)?.trim() ?? '';
          if (trimmed.length < 5) {
            this.geocodeStatus = 'idle';
          }
        }),
        filter((address) => ((address as string)?.trim().length ?? 0) >= 5),
        tap(() => (this.geocodeStatus = 'searching')),
        switchMap((address) => this.geocodingService.geocodeAddress(address as string)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((location) => {
        if (!location) {
          this.geocodeStatus = 'not-found';
          return;
        }
        this.applyLocation(location);
        this.geocodeStatus = 'found';
      });
  }

  private applyLocation(location: MapLocation): void {
    this.latitude = location.latitude;
    this.longitude = location.longitude;
    this.form.patchValue(
      { latitude: location.latitude, longitude: location.longitude },
      { emitEvent: false }
    );
  }
}
