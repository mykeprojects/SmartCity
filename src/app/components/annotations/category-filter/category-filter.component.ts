
import { CategoryNode } from 'src/app/models/territorial/categoryNode';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { OnInit } from '@angular/core';
import { AnnotationCategoryService } from 'src/app/services/territorial/annotation-category.service';
import { AnnotationCategory } from 'src/app/models/territorial/annotation-category';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-category-filter',
  imports: [MatTreeModule, MatCheckboxModule, MatButtonModule, MatIconModule, MatFormFieldModule],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss',
  standalone: true,
})
export class CategoryFilterComponent implements OnInit {
  categories: CategoryNode[] = [];
  treeControl = new NestedTreeControl<CategoryNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<CategoryNode>();
  selection = new SelectionModel<CategoryNode>(true);

  @Output() selectedCategories = new EventEmitter<number[]>();

  constructor(private categoryService: CategoryService,private annotationCategoryService: AnnotationCategoryService){}

  ngOnInit() {
    forkJoin({
      categories: this.categoryService.getAll(),
      annotationCategories: this.annotationCategoryService.getAll(),
    }).subscribe(({ categories, annotationCategories }) => {

      const categoryCount = new Map<number, number>();

      annotationCategories.forEach(ac => {
        categoryCount.set(
          ac.id_category,
          (categoryCount.get(ac.id_category) ?? 0) + 1
        );
      });

      const parents = categories.filter(c => !c.id_parent_category);
      const children = categories.filter(c => c.id_parent_category);

      const tree: CategoryNode[] = parents.map(parent => ({
        id: parent.id_category!,
        name: parent.name,
        children: [],
        amountOfMembers: categoryCount.get(parent.id_category!) ?? 0,
      }));

      children.forEach(child => {

        const parent = tree.find(
          p => p.id === child.id_parent_category!
        );

        if (parent) {
          parent.children = [
            ...parent.children,
            {
              id: child.id_category!,
              name: child.name,
              children: [],
              amountOfMembers: categoryCount.get(child.id_category!) ?? 0,
            }
          ];

          parent.amountOfMembers += categoryCount.get(child.id_category!) ?? 0
        }
      });

      this.categories = tree;
      this.dataSource.data = tree;
    });
  }

  toggle(node: CategoryNode): void {

    this.selection.toggle(node);

    const descendants = this.getDescendants(node);

    if (this.selection.isSelected(node)) {
      descendants.forEach(child => this.selection.select(child));
    } else {
      descendants.forEach(child => this.selection.deselect(child));
    }

    this.emitSelection();
  }

  isSelected(node: CategoryNode): boolean {
    return this.selection.isSelected(node);
  }

  isIndeterminate(node: CategoryNode): boolean {

    if (!node.children?.length) {
      return false;
    }

    const descendants = this.getDescendants(node);

    const selected = descendants.filter(d => this.selection.isSelected(d)).length;

    return selected > 0 && selected < descendants.length;
  }

  private getDescendants(node: CategoryNode): CategoryNode[] {

    const descendants: CategoryNode[] = [];

    const visit = (n: CategoryNode) => {

      n.children?.forEach(child => {

        descendants.push(child);

        visit(child);

      });

    };

    visit(node);

    return descendants;
  }

  private emitSelection(): void {
    this.selectedCategories.emit(
      this.selection.selected.map(node => node.id)
    );
  }
  hasChild = (_: number, node: CategoryNode) => !!node.children?.length;

}
