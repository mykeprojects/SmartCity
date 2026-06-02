import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Category } from 'src/app/models/territorial/category';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { territorialImageUrl } from 'src/app/services/territorial/territorial-api.util';

export interface CategoryFormPayload {
  category: Partial<Category>;
  imageFile?: File;
}

@Component({
  selector: 'app-category-form',
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
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  @Input() category?: Category;
  @Input() forceSubcategory = false;
  @Output() formSubmit = new EventEmitter<CategoryFormPayload>();

  form!: FormGroup;
  isEditMode = false;
  parentCategories: Category[] = [];
  imagePreviewUrl = '';
  private imageFile?: File;

  get f() {
    return this.form.controls;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.category;
    this.categoryService.getAll().subscribe({
      next: (items) => {
        const list = Array.isArray(items) ? items : [];
        this.parentCategories = list.filter((c) => !c.id_parent_category);
      },
    });

    this.form = this.fb.group({
      name: [this.category?.name ?? '', Validators.required],
      description: [this.category?.description ?? ''],
      status: [this.category?.status ?? 'active', Validators.required],
      id_parent_category: [
        this.category?.id_parent_category ?? (this.forceSubcategory ? null : null),
        this.forceSubcategory ? Validators.required : [],
      ],
    });

    this.imagePreviewUrl = territorialImageUrl(this.category?.image_url);
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = { ...this.form.value };
    if (!value.id_parent_category) {
      delete value.id_parent_category;
    }
    this.formSubmit.emit({ category: value, imageFile: this.imageFile });
  }

  onCancel(): void {
    this.router.navigate(['/admin/categories/list']);
  }
}
