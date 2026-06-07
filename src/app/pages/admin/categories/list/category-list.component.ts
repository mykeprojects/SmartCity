import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Category } from 'src/app/models/territorial/category';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { DeleteValidationService } from 'src/app/services/territorial/delete-validation.service';
import {
  territorialImageUrl,
  showApiError,
  showDeleteBlocked,
  showSuccess,
} from 'src/app/services/territorial/territorial-api.util';

interface CategoryNode {
  category: Category;
  children: CategoryNode[];
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  tree: CategoryNode[] = [];
  filteredTree: CategoryNode[] = [];
  loading = false;
  searchQuery = '';

  constructor(
    private categoryService: CategoryService,
    private deleteValidation: DeleteValidationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (items) => {
        const list = Array.isArray(items) ? items : [];
        this.tree = this.buildTree(list);
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        showApiError(err, 'No se pudieron cargar las categorías.');
      },
    });
  }

  imageUrl(path?: string): string {
    return territorialImageUrl(path);
  }

  statusLabel(status: string): string {
    if (status === 'active') return 'Activo';
    if (status === 'inactive') return 'Inactivo';
    return status;
  }

  onSearch(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilter();
  }

  goCreate(): void {
    this.router.navigate(['/admin/categories/create']);
  }

  createSubcategory(parentId: number): void {
    this.router.navigate(['/admin/categories/create'], {
      queryParams: { parentId },
    });
  }

  edit(id: number): void {
    this.router.navigate([`/admin/categories/update/${id}`]);
  }

  remove(category: Category): void {
    if (!category.id_category) return;

    this.deleteValidation.checkCategoryDeletion(category.id_category).subscribe({
      next: (check) => {
        if (!check.canDelete) {
          showDeleteBlocked('No se puede eliminar la categoría', check.blockers);
          return;
        }

        Swal.fire({
          title: '¿Eliminar categoría?',
          text: `Se eliminará "${category.name}". Esta acción no se puede deshacer.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        }).then((r) => {
          if (!r.isConfirmed) return;
          this.categoryService.delete(category.id_category!).subscribe({
            next: () => {
              showSuccess('Eliminado', 'Categoría eliminada correctamente.');
              this.load();
            },
            error: (err) => showApiError(err, 'No se pudo eliminar la categoría.'),
          });
        });
      },
    });
  }

  private applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredTree = this.tree;
      return;
    }

    this.filteredTree = this.tree
      .map((node) => {
        const parentMatches = node.category.name.toLowerCase().includes(query);
        const matchingChildren = node.children.filter((child) =>
          child.category.name.toLowerCase().includes(query)
        );

        if (parentMatches) return { ...node };
        if (matchingChildren.length) return { ...node, children: matchingChildren };
        return null;
      })
      .filter((node): node is CategoryNode => node !== null);
  }

  private buildTree(categories: Category[]): CategoryNode[] {
    const map = new Map<number, CategoryNode>();
    categories.forEach((c) => {
      if (c.id_category) map.set(c.id_category, { category: c, children: [] });
    });
    const roots: CategoryNode[] = [];
    map.forEach((node) => {
      const parentId = node.category.id_parent_category;
      if (parentId && map.has(parentId)) {
        map.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }
}
