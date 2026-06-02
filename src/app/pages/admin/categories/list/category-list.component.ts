import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Category } from 'src/app/models/territorial/category';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { territorialImageUrl, showApiError, showSuccess } from 'src/app/services/territorial/territorial-api.util';

interface CategoryNode {
  category: Category;
  children: CategoryNode[];
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  tree: CategoryNode[] = [];
  loading = false;

  constructor(private categoryService: CategoryService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (items) => {
        const list = Array.isArray(items) ? items : [];
        this.tree = this.buildTree(list);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        showApiError(err);
      },
    });
  }

  imageUrl(path?: string): string {
    return territorialImageUrl(path);
  }

  goCreate(): void {
    this.router.navigate(['/admin/categories/create']);
  }

  edit(id: number): void {
    this.router.navigate([`/admin/categories/update/${id}`]);
  }

  remove(category: Category): void {
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará "${category.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    }).then((r) => {
      if (!r.isConfirmed || !category.id_category) return;
      this.categoryService.delete(category.id_category).subscribe({
        next: () => {
          showSuccess('Eliminado');
          this.load();
        },
        error: (err) => showApiError(err),
      });
    });
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
