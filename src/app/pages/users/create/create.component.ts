import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserFormComponent } from '../components/user-form/user-form.component';
import { User } from '../../../models/user';
import { UsersService } from 'src/app/services/users.service';


@Component({
  selector: 'app-create',
  imports: [UserFormComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {

  constructor(
    private router: Router,
    private userService: UsersService
  ) { }

  /**
   * Maneja el evento de envío del formulario para crear un nuevo usuario.
   * Recibe los datos del formulario como un objeto parcial de User (sin id),
   * llama al servicio para crear el usuario en el backend, y luego navega de 
   * regreso a la lista de usuarios.
   * El uso de Partial<User> permite que el formulario solo envíe los campos necesarios
   * para crear un nuevo usuario,
   * @param formValue 
   */

  onCreate(formValue: Partial<User>) {
    console.log('Crear usuario con datos:', formValue);
    this.userService.create(formValue).subscribe(() => {
      this.router.navigate(['/users/list']);
    });
  }
}