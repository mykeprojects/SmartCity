// user-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  @Input() user?: User;                          // undefined = crear, definido = editar
  @Output() formSubmit = new EventEmitter<User>(); // el padre decide qué hacer


  form!: FormGroup;
  isEditMode = false;
  

  /**
   * Getter para acceder fácilmente a los controles del formulario en la plantilla (ej: f.name, f.email, etc.),
   * lo que mejora la legibilidad del código HTML y evita tener que escribir form.controls.name cada vez.
   * Esto es especialmente útil para mostrar mensajes de error específicos para cada campo, como f.name.errors?.required.
   * Al usar este getter, el código en la plantilla se vuelve más limpio y fácil de entender.
   * Además, al ser un getter, se recalcula automáticamente cada vez que se accede a él, 
   * asegurando que siempre se tenga la referencia actualizada a los controles del formulario.
   */
  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    console.log('Inicializando UserFormComponent con user:', this.user);
    this.isEditMode = !!this.user;

    this.form = this.fb.group({
      name: [this.user?.name ?? '', Validators.required],
      username: [this.user?.username ?? '', Validators.required],
      email: [this.user?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.user?.phone ?? '', [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
      website: [this.user?.website ?? '', [Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i)]],
    });
  }

  /**
   * Maneja el evento de envío del formulario, validando los datos ingresados y emitiendo un objeto User con los valores del formulario.
   * Si el formulario es inválido, no se emite ningún evento y se pueden mostrar mensajes de error en la plantilla.
   * El payload emitido incluye todos los campos del formulario, y si se está editando un usuario existente, también conserva el id.
   * 
   * @returns 
   */
  onSubmit() {
    console.log('Formulario enviado con valores:', this.form.value);
    if (this.form.invalid) return;

    const payload: User = {
      ...this.user,          // conserva el id si existe
      ...this.form.value,
    };

    this.formSubmit.emit(payload);
  }

  onCancel() {
    this.form.reset();
    // Navegar a la lista de usuarios (coincide con otros usos en el proyecto)
    this.router.navigate(['/users/list']);
  }
}


