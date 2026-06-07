import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryFormComponent, CategoryFormPayload } from '../components/category-form/category-form.component';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CategoryFormComponent],
  template: `<app-category-form [presetParentId]="presetParentId" (formSubmit)="onCreate($event)" />`,
})
export class CategoryCreateComponent implements OnInit {
  presetParentId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    const parentIdParam = this.route.snapshot.queryParamMap.get('parentId');
    if (parentIdParam) {
      const parentId = Number(parentIdParam);
      if (!isNaN(parentId)) {
        this.presetParentId = parentId;
      }
    }
  }

  onCreate(payload: CategoryFormPayload): void {
    this.categoryService.create(payload.category, payload.imageFile).subscribe({
      next: () => {
        showSuccess('Creado', 'Categoría registrada correctamente.');
        this.router.navigate(['/admin/categories/list']);
      },
      error: (err) => showApiError(err, 'No se pudo registrar la categoría.'),
    });
  }
}
