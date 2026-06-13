import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Annotation } from 'src/app/models/annotations/annotation';
import { AnnotationForDisplay } from 'src/app/models/annotations/annotationForDisplay';
import { Category } from 'src/app/models/territorial/category';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { Entity } from 'src/app/models/territorial/entity';
import { EntityService } from 'src/app/services/territorial/entity.service';
@Component({
  selector: 'app-map-annotation-form',
  imports: [MapComponent, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule,],
  templateUrl: './annotation-form.component.html',
  styleUrl: './annotation-form.component.scss',
  standalone: true,
})
export class AnnotationForm implements OnInit{
    @Input() annotation?: Annotation;
    @Input() annotationForDisplay?: AnnotationForDisplay; 
    @Output() formSubmit = new EventEmitter<Partial<Annotation>>();

    form!: FormGroup;
    isViewMode = false;
    categories: Category[] = [];
    subCategories: Category[] = [];
    entities: Entity[] = [];
    
    get f() { return this.form.controls; }

    constructor(private fb: FormBuilder,private categoryService: CategoryService,private entityService: EntityService, ) { }
    
    ngOnInit() {
        this.isViewMode = !!this.annotation;
        this.categoryService.getParentCategories().subscribe(categories => {
          this.categories = categories;
        })
        this.entityService.getAll().subscribe(entities =>{
          this.entities = entities;
        })

        this.form = this.fb.group({
          neighborhood: [{value: this.annotationForDisplay?.neighborhood_name ?? 'Sin barrio asociado', disabled: true}],
          category: [{value:'', disabled: this.isViewMode}, Validators.required],
          subCategory : {value:'', disabled: this.isViewMode},
          entities: [{value: [], disabled: this.isViewMode},],
          date: [{value: this.annotationForDisplay?.registration_date ?? '', disabled: true}],
          status: [this.annotation?.status ?? ''],
          description: [this.annotation?.description ?? '', Validators.required],
        });

        this.form.get('category')?.valueChanges.subscribe(id => {
          if (id) {
            this.categoryService.getChildCategories(id)
              .subscribe(categories => {
                this.subCategories = categories;
              });
          } else {
            this.subCategories = [];
          }
        });
    }
    onSubmit() {
      console.log('Formulario enviado con valores:', this.form.value);
      if (this.form.invalid) return;

      const payload: Annotation = {
        ...this.form.value,
      };

      this.formSubmit.emit(payload);
    }


}


