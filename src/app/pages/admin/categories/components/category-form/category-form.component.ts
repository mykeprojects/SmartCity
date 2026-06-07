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
  @Input() presetParentId?: number;
  @Output() formSubmit = new EventEmitter<CategoryFormPayload>();

  form!: FormGroup;
  isEditMode = false;
  parentCategories: Category[] = [];
  presetParentName = '';
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
    const initialParentId = this.category?.id_parent_category ?? this.presetParentId ?? null;

    this.categoryService.getAll().subscribe({
      next: (items) => {
        const list = Array.isArray(items) ? items : [];
        this.parentCategories = list.filter(
          (c) =>
            !c.id_parent_category &&
            c.id_category !== this.category?.id_category
        );
        if (this.presetParentId) {
          const parent = list.find((c) => c.id_category === this.presetParentId);
          this.presetParentName = parent?.name ?? '';
        }
      },
    });

    this.form = this.fb.group({
      name: [this.category?.name ?? '', [Validators.required, Validators.maxLength(120)]],
      description: [this.category?.description ?? '', [Validators.maxLength(500)]],
      status: [this.category?.status ?? 'active', Validators.required],
      id_parent_category: [initialParentId],
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = { ...this.form.getRawValue() };
    value.name = (value.name as string)?.trim();
    value.description = (value.description as string)?.trim();
    if (!value.id_parent_category) {
      delete value.id_parent_category;
    }

    this.formSubmit.emit({ category: value, imageFile: this.imageFile });
  }

  onCancel(): void {
    this.router.navigate(['/admin/categories/list']);
  }
}
