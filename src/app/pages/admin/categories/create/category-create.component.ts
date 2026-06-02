import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryFormComponent, CategoryFormPayload } from '../components/category-form/category-form.component';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CategoryFormComponent],
  template: '<app-category-form (formSubmit)="onCreate($event)" />',
})
export class CategoryCreateComponent {
  constructor(private router: Router, private categoryService: CategoryService) {}

  onCreate(payload: CategoryFormPayload): void {
    this.categoryService.create(payload.category, payload.imageFile).subscribe({
      next: () => {
        showSuccess('Creado', 'Categoría registrada.');
        this.router.navigate(['/admin/categories/list']);
      },
      error: (err) => showApiError(err),
    });
  }
}
