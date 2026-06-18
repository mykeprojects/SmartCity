
import { CategoryNode } from 'src/app/models/territorial/categoryNode';
import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
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
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';
import { Commune } from 'src/app/models/territorial/commune';
import { NeighborhoodService } from 'src/app/services/territorial/neighborhood.service';
import { CommuneService } from 'src/app/services/territorial/commune.service';
import { MatOption } from '@angular/material/select';
import { Annotation } from 'src/app/models/territorial/annotation';
import { AnnotationService } from 'src/app/services/territorial/annotation.service';
import { Category } from 'src/app/models/territorial/category';


@Component({
  selector: 'app-category-filter',
  imports: [MatTreeModule, MatCheckboxModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelect, MatOption, ],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss',
  standalone: true,
})
export class CategoryFilterComponent implements OnInit, OnChanges {
  categories: CategoryNode[] = [];
  treeControl = new NestedTreeControl<CategoryNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<CategoryNode>();
  selection = new SelectionModel<CategoryNode>(true);
  neighborhoods: Neighborhood[];
  communes: Commune[];
  allAnnotationCategories: AnnotationCategory[];
  allAnnotations: Annotation[];
  allCategories: Category[];
  selectedCommuneNeighborhoods: Neighborhood[];
  selectedCommune: number | null;
  selectedNeighborhood: number | null;

  @Input() refreshTrigger?: number;
  @Output() selectedCategories = new EventEmitter<number[]>();
  @Output() currentCommune = new EventEmitter<number | null>;
  @Output() currentNeighborhood = new EventEmitter<number | null>;

  constructor(private categoryService: CategoryService,private annotationCategoryService: AnnotationCategoryService,
    private neighborhoodService: NeighborhoodService, private communeService: CommuneService, private annotationService: AnnotationService){}

  ngOnInit() {
    this.fetchData()
  }

 ngOnChanges(changes: SimpleChanges){
    if (changes['refreshTrigger']){
      this.fetchData();
    }
 }

  private fetchData(){
    forkJoin({
      categories: this.categoryService.getAll(),
      annotationCategories: this.annotationCategoryService.getAll(),
      neighborhoods: this.neighborhoodService.getAll(),
      communes: this.communeService.getAll(),
      annotations: this.annotationService.getAnnotations(),
    }).subscribe(({ categories, annotationCategories, neighborhoods, communes, annotations }) => {
      this.neighborhoods = neighborhoods;
      this.communes = communes;
      this.allAnnotationCategories = annotationCategories;
      this.allAnnotations = annotations;
      this.allCategories = categories;
      this.rebuildTree(annotationCategories);
    });
  }

  private rebuildTree(annotationCategories: AnnotationCategory[]): void {

    const allowedAnnotationIds = new Set<number>();

    annotationCategories.forEach(ac => {
      if (this.isAnnotationNeighborhoodAllowed(ac.id_annotation)) {
        allowedAnnotationIds.add(ac.id_annotation);
      }
    });

    const categoryCount = new Map<number, number>();

    annotationCategories.forEach(ac => {

      if (!allowedAnnotationIds.has(ac.id_annotation)) {
        return;
      }

      categoryCount.set(
        ac.id_category,
        (categoryCount.get(ac.id_category) ?? 0) + 1
      );
    });
    console.log("Allowed annotations:", allowedAnnotationIds.size);
    console.log("Category count:", categoryCount);
    const parents = this.allCategories.filter(c => !c.id_parent_category);
    const children = this.allCategories.filter(c => c.id_parent_category);

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

  handleCommuneChange(newCommune: number | null){
    this.selectedCommune = newCommune;
    this.selectedCommuneNeighborhoods = this.neighborhoods.filter(neighborhood => neighborhood.id_commune === newCommune);
    this.currentCommune.emit(newCommune);
    if (!newCommune){
      this.handleNeighborhoodChange(null);
    }
    this.rebuildTree(this.allAnnotationCategories);
  }

  handleNeighborhoodChange(newNeighborhood: number | null){
    this.selectedNeighborhood = newNeighborhood;
    this.currentNeighborhood.emit(newNeighborhood);
    this.rebuildTree(this.allAnnotationCategories);
  }

  handleRefresh(){
    this.handleCommuneChange(null);
    this.selection.clear();
    this.emitSelection();
  }

  isAnnotationNeighborhoodAllowed(annotation: number | null): boolean{
    if (!this.selectedCommune){
      return true;
    }
    if (!annotation){
      return false;
    }
    const allowedNeighborhoods = this.filterNeighborhoods();
    const currentAnnotation = this.allAnnotations.find(anyAnnotation => anyAnnotation.id_annotation === annotation);
    const found = allowedNeighborhoods.find(neighborhood => neighborhood.id_neighborhood === currentAnnotation?.id_neighborhood);
    return (!!found);
  }

    filterNeighborhoods(): Neighborhood[]{
      const filteredNeighborhoods: Neighborhood[] = [];
      if (!this.selectedCommune){
        return this.neighborhoods;
      }
      else {
        if (!this.selectedNeighborhood){
          return this.neighborhoods.filter(neighborhood => neighborhood.id_commune === this.selectedCommune)
        }
        const selectedNeighborhood = this.neighborhoods.find(neighborhood => neighborhood.id_neighborhood === this.selectedNeighborhood)
        if (selectedNeighborhood){
          filteredNeighborhoods.push(selectedNeighborhood);
        }
      }
      return filteredNeighborhoods;
    }




}
