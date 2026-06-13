import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Commune } from 'src/app/models/territorial/commune';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';

@Component({
  selector: 'app-neighborhood-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './neighborhood-form.component.html',
  styleUrl: './neighborhood-form.component.scss',
})
export class NeighborhoodFormComponent implements OnInit {
  @Input() comunas: Commune[] = []; 
  @Input() datosIniciales?: Neighborhood; 

  // Emitimos el tipo exacto que espera el método create del servicio
  @Output() alGuardar = new EventEmitter<Omit<Neighborhood, 'id_neighborhood'>>();
  @Output() alCerrar = new EventEmitter<void>();

  barrioForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    // Los nombres de los controles ahora coinciden con tu interfaz Neighborhood
    this.barrioForm = this.fb.group({
      id_commune: [this.datosIniciales?.id_commune || '', Validators.required],
      name: [this.datosIniciales?.name || '', [Validators.required]],
      status: [this.datosIniciales?.status || 'activo', Validators.required]
    });
  }

  enviarFormulario(): void {
    if (this.barrioForm.valid) {
      this.alGuardar.emit(this.barrioForm.value);
    } else {
      this.barrioForm.markAllAsTouched();
    }
  }

  cerrarModal(): void {
    this.alCerrar.emit();
  }
}
