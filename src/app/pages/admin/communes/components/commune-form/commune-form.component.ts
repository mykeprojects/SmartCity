import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';

import { Commune } from 'src/app/models/territorial/commune';
import { Department } from 'src/app/models/territorial/department';
import { City } from 'src/app/models/territorial/city';
import { DepartmentService } from 'src/app/services/territorial/department.service';
import { CityService } from 'src/app/services/territorial/city.service';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { isPagedResponse, showApiError } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-commune-form',
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
  templateUrl: './commune-form.component.html',
})
export class CommuneFormComponent implements OnInit {
  @Input() commune?: Commune;
  @Output() formSubmit = new EventEmitter<Partial<Commune>>();

  form!: FormGroup;
  isEditMode = false;
  departments: Department[] = [];
  cities: City[] = [];
  communesInCity: Commune[] = [];
  loadingCities = false;
  noDepartments = false;

  get f() {
    return this.form.controls;
  }

  get citySelectDisabled(): boolean {
    return !this.form?.value?.id_department || this.loadingCities;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private communeService: CommuneService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.commune;

    this.departmentService.getAll().subscribe({
      next: (d) => {
        this.departments = Array.isArray(d) ? d : [];
        this.noDepartments = this.departments.length === 0;
      },
      error: (err) => showApiError(err, 'No se pudieron cargar los departamentos.'),
    });

    this.form = this.fb.group({
      id_department: [null as number | null, Validators.required],
      id_city: [{ value: this.commune?.id_city ?? null, disabled: true }, Validators.required],
      name: [this.commune?.name ?? '', [Validators.required, Validators.maxLength(120)]],
      status: [this.commune?.status ?? 'active', Validators.required],
    });

    if (this.commune?.id_city) {
      this.initEditMode(this.commune.id_city);
    }

    this.form.get('id_department')?.valueChanges.subscribe((deptId: number) => {
      this.form.patchValue({ id_city: null }, { emitEvent: false });
      this.cities = [];
      this.communesInCity = [];
      const cityControl = this.form.get('id_city');
      if (deptId) {
        cityControl?.enable({ emitEvent: false });
        this.loadCitiesByDepartment(deptId);
      } else {
        cityControl?.disable({ emitEvent: false });
      }
    });

    this.form.get('id_city')?.valueChanges.subscribe((cityId: number) => {
      if (cityId) this.loadCommunesInCity(cityId);
    });
  }

  private initEditMode(cityId: number): void {
    this.cityService.getById(cityId).subscribe({
      next: (city) => {
        this.form.patchValue({ id_department: city.id_department });
        this.form.get('id_city')?.enable({ emitEvent: false });
        this.loadCitiesByDepartment(city.id_department, city.id_city);
        this.loadCommunesInCity(cityId);
      },
    });
  }

  private loadCitiesByDepartment(deptId: number, selectCityId?: number): void {
    this.loadingCities = true;
    this.cityService.getByDepartment(deptId).subscribe({
      next: (cities) => {
        this.cities = cities;
        this.loadingCities = false;
        if (selectCityId) {
          this.form.patchValue({ id_city: selectCityId }, { emitEvent: false });
        }
      },
      error: () => {
        this.loadingCities = false;
        this.cities = [];
      },
    });
  }

  private loadCommunesInCity(cityId: number): void {
    this.communeService.search(1, 500, { id_city: String(cityId) }).subscribe({
      next: (resp) => {
        this.communesInCity = isPagedResponse<Commune>(resp) ? resp.items : [];
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = (this.form.getRawValue().name as string).trim();
    const cityId = this.form.getRawValue().id_city as number;
    const duplicate = this.communesInCity.some(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() &&
        c.id_commune !== this.commune?.id_commune
    );

    if (duplicate) {
      Swal.fire(
        'Nombre duplicado',
        'Ya existe una comuna con ese nombre en la ciudad seleccionada.',
        'warning'
      );
      return;
    }

    this.formSubmit.emit({
      id_city: cityId,
      name,
      status: this.form.getRawValue().status,
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/communes/list']);
  }
}
