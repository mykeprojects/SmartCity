import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Annotation } from 'src/app/models/annotations/annotation';
import { AnnotationForDisplay } from 'src/app/models/annotations/annotationForDisplay';
@Component({
  selector: 'app-map-annotation-form',
  imports: [MapComponent, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './annotation-form.component.html',
  styleUrl: './annotation-form.component.scss',
  standalone: true,
})
export class AnnotationForm implements OnInit{
    @Input() annotation?: Annotation;
    @Input() annotationForDisplay?: AnnotationForDisplay; 
    @Output() formSubmit = new EventEmitter<Partial<Annotation>>();

    form!: FormGroup;
    isEditMode = false;
    
    get f() { return this.form.controls; }

    constructor(private fb: FormBuilder,) { }
    
    ngOnInit() {
        this.isEditMode = !!this.annotation;

        this.form = this.fb.group({
          neighborhood: [{value: this.annotationForDisplay?.neighborhood_name ?? 'Sin barrio asociado', disabled: true}],
          citizen: [{value: this.annotationForDisplay?.citizen_name ?? '', disabled: true}, Validators.required],
          date: [{value: this.annotationForDisplay?.registration_date ?? '', disabled: true}],
          status: [this.annotation?.status ?? ''],
          description: [this.annotation?.description ?? '', Validators.required]  
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


