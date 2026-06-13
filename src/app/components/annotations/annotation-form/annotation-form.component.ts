import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
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
import { SecurityService } from 'src/app/services/security.service';
import { AnnotationService } from 'src/app/services/territorial/annotation.service';
import Swal from 'sweetalert2';
import { formatCurrency } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AnnotationCategoryService } from 'src/app/services/territorial/annotation-category.service';
import { AnnotationCategory } from 'src/app/models/territorial/annotation-category';
import { InterestedPartyService } from 'src/app/services/territorial/interested-party.service';
import { InterestedParty } from 'src/app/models/territorial/interested-party';
import { EvidenceService } from 'src/app/services/territorial/evidence.service';
import { Evidence } from 'src/app/models/territorial/evidence';
import { environment } from 'src/environments/environments';
@Component({
  selector: 'app-map-annotation-form',
  imports: [MapComponent, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule,],
  templateUrl: './annotation-form.component.html',
  styleUrl: './annotation-form.component.scss',
  standalone: true,
})
export class AnnotationForm implements OnInit{
  @Input() annotationForDisplay?: AnnotationForDisplay | null; 
  @Input() coordinates?: [number, number] | null;
  @Output() formSubmit = new EventEmitter<Annotation>();

  form!: FormGroup;
  isViewMode = false;
  categories: Category[] = [];
  subCategories: Category[] = [];
  entities: Entity[] = [];
  previews: string[] = [];
  
  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder,private categoryService: CategoryService,private entityService: EntityService,
    private securityService: SecurityService, private annotationService: AnnotationService,
    private annotationCategoryService: AnnotationCategoryService, private interestedPartyService: InterestedPartyService,
    private evidenceService: EvidenceService) { }
  
  ngOnInit() {
      this.categoryService.getParentCategories().subscribe(categories => {
        this.categories = categories;
      })
      this.entityService.getAll().subscribe(entities =>{
        this.entities = entities;
      })

      this.initForm();

      // Apply any input already received before ngOnInit ran
      if (this.annotationForDisplay) {
        this.patchFormWithAnnotation(this.annotationForDisplay);
      }
  }

  private initForm() {
      this.form = this.fb.group({
        neighborhood: [{value: this.annotationForDisplay?.neighborhood_name ?? 'Sin barrio asociado', disabled: true}],
        category: [{value: null, disabled: this.isViewMode}, Validators.required],
        subCategory : {value: null, disabled: this.isViewMode},
        entities: [{value: [], disabled: this.isViewMode},],
        date: [{value: this.annotationForDisplay?.registration_date ?? '', disabled: true}],
        status: [{value: 'open',disabled: true}],
        description: [{value: '', disabled: this.isViewMode}, Validators.required],
        images: [''],
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

  private patchFormWithAnnotation(annotation: AnnotationForDisplay) {
      this.form.patchValue({
        neighborhood: annotation.neighborhood_name,
        status: annotation.status,
        description: annotation.description,
      });
      console.log(annotation);
      if (annotation.subCategory){
        this.form.get('subCategory')?.enable();
        this.form.get('subCategory')?.setValue(annotation.subCategory);
        this.form.get('subCategory')?.disable();
      }
      this.form.get('category')?.enable();
      this.form.get('category')?.setValue(annotation.category);
      this.form.get('category')?.disable();
      this.form.get('subCategory')?.disable();

      this.form.get('description')?.disable();

      this.form.get('entities')?.setValue(annotation.interestedParties);

      if (annotation.evidences && annotation.evidences.length > 0) {
        // revoke any previous object URLs
        this.previews.forEach(url => URL.revokeObjectURL(url));

        this.previews = annotation.evidences
          .map(ev => {
            const fileUrl = ev?.file_url ?? '';
            if (!fileUrl) return '';
            if (fileUrl.startsWith('http')) return fileUrl;

            const base = environment.apiUrl.replace(/\/$/, '');
            return fileUrl.startsWith('/') ? `${base}${fileUrl}` : `${base}/${fileUrl}`;
          })
          .filter(u => !!u);
      } else {
        this.previews = [];
      }
  }
  private cleanForm(){
      this.form.patchValue({
        neighborhood: null,
        status: 'active',
        description: null,
        images: null
      });
      this.form.get('category')?.enable();
      this.form.get('subCategory')?.enable();
      this.form.get('description')?.enable();
      this.previews = [];
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes['annotationForDisplay']){
      if (this.annotationForDisplay){
        //To do: Categoría, entidades,
        this.isViewMode = true;
        if (this.form) {
          this.patchFormWithAnnotation(this.annotationForDisplay);
        }
        else{
          this.cleanForm();
        }
      }
    if (changes['coordinates']){
      if (this.coordinates){
        this.isViewMode = false;
        console.log(("entró"))
        this.cleanForm();
      }
    }
    }
  }


  async onSubmit() {
    console.log('Formulario enviado con valores:', this.form.value);
    if (this.form.invalid) return;

    this.securityService.getUserIdInBackend().subscribe(userId=>{
      if (!userId){
        Swal.fire({
          title: 'Error',
          text: 'La sesión del usuario actual no se encuentra registrada en el backend',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ef4444'
        });
        return;
      }

      if(this.coordinates){
        const annotation: Partial<Annotation> = {
          description: this.form.value.description,
          id_citizen: userId,
          latitude: this.coordinates[0],
          longitude: this.coordinates[1],
          status: this.form.getRawValue().status,
        }

        if (!annotation.id_neighborhood){

          Swal.fire({
            title: 'Advertencia',
            text: 'Las coordenadas actuales no están dentro del perimetro de un barrio registrado. ¿Desea crear la anotación sin ningún barrio?',
            icon: 'warning',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Aceptar',
            denyButtonText: 'Rechazar'
          }).then((result) => {
            if (result.isDenied) {
              return;
            }
            let createdAnnotation: Annotation;
            this.annotationService.create(annotation).subscribe(newAnnotation=>{
              createdAnnotation = newAnnotation;
              
              const saveTasks = [];

              // Determine category id (prefer subCategory if present). Ensure it's a valid number before creating.
              const rawCat = this.form.getRawValue().subCategory ?? this.form.getRawValue().category;
              const categoryId = rawCat === null || rawCat === undefined || rawCat === '' ? undefined : Number(rawCat);
              if (categoryId && !Number.isNaN(categoryId)) {
                const annotationCategory: AnnotationCategory = {
                  id_annotation: createdAnnotation.id_annotation,
                  id_category: categoryId,
                };

                saveTasks.push(this.annotationCategoryService.create(annotationCategory));
              } else {
                console.warn('No valid category selected for annotation', createdAnnotation.id_annotation, rawCat);
              }

              const entities: number[] = this.form.getRawValue().entities ?? [];

              entities.forEach(entity => {
                const link: Partial<InterestedParty> = {
                  id_annotation: createdAnnotation.id_annotation,
                  id_entity: entity,
                };

                saveTasks.push(this.interestedPartyService.create(link));
              });

              const files: File[] = this.form.getRawValue().images || [];
              files.forEach(file => {
                const evidence: Partial<Evidence> = {
                  id_annotation: createdAnnotation.id_annotation,
                  file_type: file.type,
                  file_size: file.size
                };
                saveTasks.push(this.evidenceService.create(evidence, file));
              });

              if (saveTasks.length > 0) {
                forkJoin(saveTasks).subscribe(() => {
                  this.formSubmit.emit(newAnnotation);
                });
              } else {
                this.formSubmit.emit(newAnnotation);
              }
            });
          });
        }
      }

      else{
        Swal.fire({
          title: 'Error',
          text: 'Por favor seleccione un punto en el mapa antes de crear una anotación',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ef4444'
        });
        return;
      }
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    this.form.patchValue({
      images: files
    });

    // limpiar previews anteriores (opcional)
    this.previews.forEach(url => URL.revokeObjectURL(url));

    // crear nuevas previews
    this.previews = files.map(file => URL.createObjectURL(file));

    // opcional: reset input
    input.value = '';
  }
}


