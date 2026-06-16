import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/models/territorial/category';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { CategoryFormComponent } from '../components/category-form/category-form.component';
import { CategoryFormPayload } from 'src/app/models/admin/category-form-payload';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-category-update',
  standalone: true,
  imports: [CategoryFormComponent],
  template: `@if (category) {
    <app-category-form [category]="category" (formSubmit)="onUpdate($event)" />
  } @else { <p>Cargando...</p> }`,
})
export class CategoryUpdateComponent implements OnInit {
  category?: Category;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.id)) {
      this.router.navigate(['/admin/categories/list']);
      return;
    }
    this.categoryService.getById(this.id).subscribe({
      next: (c) => (this.category = c),
      error: () => this.router.navigate(['/admin/categories/list']),
    });
  }

  onUpdate(payload: CategoryFormPayload): void {
    this.categoryService.update(this.id, payload.category, payload.imageFile).subscribe({
      next: () => {
        showSuccess('Actualizado', 'Categoría actualizada correctamente.');
        this.router.navigate(['/admin/categories/list']);
      },
      error: (err) => showApiError(err, 'No se pudo actualizar la categoría.'),
    });
  }
}
